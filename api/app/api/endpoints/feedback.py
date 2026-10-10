from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import UUID4
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.auth import get_current_user, require_role
from app.models.users import User, RoleEnum
from app.models.feedback import Feedback, AuthorTypeEnum, TargetTypeEnum
from app.models.application import Application
from app.models.job import JobRequirement
from app.models.interview import Interview
from app.models.audit import AuditLog
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter()


def _validate_student_interaction(
    db: Session,
    student_id: Any,
    target_type: TargetTypeEnum,
    target_id: Any,
) -> None:
    """
    Ensure the student actually interacted with the target:
      - target_type=company  → must have applied to at least one job from that company
      - target_type=job      → must have applied to that job
      - target_type=interview→ must own an application whose interview matches
    """
    if target_type == TargetTypeEnum.platform:
        return

    if target_type == TargetTypeEnum.company:
        exists = (
            db.query(Application)
            .join(JobRequirement, Application.job_id == JobRequirement.id)
            .filter(
                Application.student_id == student_id,
                JobRequirement.company_id == target_id,
            )
            .first()
        )
        if not exists:
            raise HTTPException(
                status_code=400,
                detail="No interaction found: you have not applied to any job from this company (R.8-E1)",
            )

    elif target_type == TargetTypeEnum.job:
        exists = (
            db.query(Application)
            .filter(
                Application.student_id == student_id,
                Application.job_id == target_id,
            )
            .first()
        )
        if not exists:
            raise HTTPException(
                status_code=400,
                detail="No interaction found: you have not applied to this job (R.8-E1)",
            )

    elif target_type == TargetTypeEnum.interview:
        exists = (
            db.query(Interview)
            .join(Application, Interview.application_id == Application.id)
            .filter(
                Application.student_id == student_id,
                Interview.id == target_id,
            )
            .first()
        )
        if not exists:
            raise HTTPException(
                status_code=400,
                detail="No interaction found: this interview is not associated with your applications (R.8-E1)",
            )

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Students cannot leave feedback with target_type={target_type}",
        )


def _validate_company_interaction(
    db: Session,
    company_id: Any,
    target_type: TargetTypeEnum,
    target_id: Any,
) -> None:
    """
    Companies can only leave feedback for students who applied to one of their jobs.
    """
    if target_type == TargetTypeEnum.platform:
        return

    if target_type != TargetTypeEnum.student:
        raise HTTPException(
            status_code=400,
            detail=f"Companies cannot leave feedback with target_type={target_type}",
        )

    exists = (
        db.query(Application)
        .join(JobRequirement, Application.job_id == JobRequirement.id)
        .filter(
            Application.student_id == target_id,
            JobRequirement.company_id == company_id,
        )
        .first()
    )
    if not exists:
        raise HTTPException(
            status_code=400,
            detail="No interaction found: this student has not applied to any of your jobs (R.8-E1)",
        )


@router.post("/", response_model=FeedbackOut, status_code=201)
def submit_feedback(
    *,
    db: Session = Depends(get_db),
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.role not in (RoleEnum.student, RoleEnum.company):
        raise HTTPException(status_code=403, detail="Only students and companies can submit feedback")

    if current_user.role == RoleEnum.student:
        student = current_user.student
        if not student:
            raise HTTPException(status_code=400, detail="Student profile not found")
        _validate_student_interaction(db, student.id, feedback_in.target_type, feedback_in.target_id)
        author_type = AuthorTypeEnum.student
        author_id = student.id

    else:  # company
        company = current_user.company
        if not company:
            raise HTTPException(status_code=400, detail="Company profile not found")
        _validate_company_interaction(db, company.id, feedback_in.target_type, feedback_in.target_id)
        author_type = AuthorTypeEnum.company
        author_id = company.id

    feedback = Feedback(
        author_type=author_type,
        author_id=author_id,
        target_type=feedback_in.target_type,
        target_id=feedback_in.target_id,
        content=feedback_in.content,
        rating=feedback_in.rating,
        flagged=False,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/", response_model=List[FeedbackOut])
def list_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    flagged: Optional[bool] = Query(None, description="Filter by flagged status"),
    author_type: Optional[AuthorTypeEnum] = Query(None, description="Filter by author type"),
    _=Depends(require_role(["admin"])),
) -> Any:
    query = db.query(Feedback)
    if flagged is not None:
        query = query.filter(Feedback.flagged == flagged)
    if author_type is not None:
        query = query.filter(Feedback.author_type == author_type)
    return query.order_by(Feedback.created_at.desc()).all()


@router.patch("/{id}/flag", response_model=FeedbackOut)
def flag_feedback(
    id: UUID4,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _=Depends(require_role(["admin"])),
) -> Any:
    """Toggle the flagged state of a feedback entry (R.21/R.22). Writes audit log."""
    feedback = db.query(Feedback).filter(Feedback.id == id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    previous_state = feedback.flagged
    feedback.flagged = not feedback.flagged
    db.flush()

    # Rule 3 — audit log every flag/unflag action
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="flag_feedback" if feedback.flagged else "unflag_feedback",
        entity_type="feedback",
        entity_id=feedback.id,
        metadata_info={"previous_flagged": previous_state, "new_flagged": feedback.flagged},
    )
    db.add(audit)
    db.commit()
    db.refresh(feedback)
    return feedback

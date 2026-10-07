from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import UUID4
from app.db.session import get_db
from app.core.auth import get_current_user
from app.models.users import User, RoleEnum
from app.models.application import Application
from app.models.interview import Interview, InterviewStatusEnum
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewOut
from app.services.status import update_application_status
from app.services.notifications import notify_student_interview
from app.models.audit import AuditLog

router = APIRouter()

@router.post("/", response_model=InterviewOut, status_code=201)
def create_interview(
    *,
    db: Session = Depends(get_db),
    interview_in: InterviewCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    application = db.query(Application).filter(Application.id == interview_in.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    interview = Interview(
        application_id=interview_in.application_id,
        scheduled_at=interview_in.scheduled_at,
        location_or_mode=interview_in.location_or_mode,
        created_by=current_user.admin.id
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    
    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="interview.create",
        entity_type="interview",
        entity_id=interview.id,
        metadata={"application_id": str(application.id)}
    )
    db.add(audit)
    db.commit()

    # Update status
    update_application_status(db, application.id)
    
    # Notify student
    notify_student_interview(
        db=db,
        student_user=application.student.user,
        job_title=application.job.title,
        scheduled_at=interview_in.scheduled_at.isoformat(),
        location=interview_in.location_or_mode,
        background_tasks=background_tasks
    )
    
    return interview

@router.patch("/{id}", response_model=InterviewOut)
def update_interview(
    *,
    db: Session = Depends(get_db),
    id: UUID4,
    interview_in: InterviewUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    interview = db.query(Interview).filter(Interview.id == id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    update_data = interview_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(interview, field, value)
        
    db.add(interview)
    db.commit()
    db.refresh(interview)
    
    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="interview.update",
        entity_type="interview",
        entity_id=interview.id,
        metadata=update_data
    )
    db.add(audit)
    db.commit()
    
    # Update status
    update_application_status(db, interview.application_id)
    
    # Notify student (if rescheduled or cancelled)
    notify_student_interview(
        db=db,
        student_user=interview.application.student.user,
        job_title=interview.application.job.title,
        scheduled_at=interview.scheduled_at.isoformat(),
        location=interview.location_or_mode,
        background_tasks=background_tasks
    )
    
    return interview

@router.get("/", response_model=List[InterviewOut])
def list_interviews(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role == RoleEnum.admin:
        interviews = db.query(Interview).offset(skip).limit(limit).all()
    elif current_user.role == RoleEnum.student:
        interviews = db.query(Interview).join(Application).filter(
            Application.student_id == current_user.student.id
        ).offset(skip).limit(limit).all()
    elif current_user.role == RoleEnum.company:
        interviews = db.query(Interview).join(Application).filter(
            Application.job.has(company_id=current_user.company.id)
        ).offset(skip).limit(limit).all()
    else:
        interviews = []
        
    return interviews

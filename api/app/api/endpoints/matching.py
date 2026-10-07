from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.core.auth import get_current_user, require_role
from app.models.users import User
from app.schemas.auth import TokenPayload
from app.models.job import JobRequirement
from app.models.match import Match
from app.schemas.match import MatchOut
from app.services.matching import run_matching_for_job

router = APIRouter()

@router.post("/{job_id}/run-matching")
def trigger_matching(
    job_id: UUID, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    background_tasks.add_task(run_matching_for_job, db, job_id)
    return {"message": "Matching process started in background"}

@router.get("/{job_id}/matches", response_model=List[MatchOut])
def get_job_matches(
    job_id: UUID,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Rank candidates: hard_filter_passed first, then by skill_score
    matches = db.query(Match).filter(Match.job_id == job_id).order_by(
        Match.hard_filter_passed.desc(),
        Match.skill_score.desc()
    ).all()
    
    result = []
    for m in matches:
        # Pydantic will serialize this correctly because we can return a dict or we can just attach it to the ORM object
        m_dict = {
            "id": m.id,
            "job_id": m.job_id,
            "student_id": m.student_id,
            "application_id": m.application_id,
            "skill_score": m.skill_score,
            "hard_filter_passed": m.hard_filter_passed,
            "included_in_shortlist": m.included_in_shortlist,
            "forwarding_status": m.forwarding_status.value,
            "created_at": m.created_at,
            "updated_at": m.updated_at,
            "student": m.student,
            "student_skills": m.student.cv.skills if (m.student and m.student.cv and m.student.cv.skills) else []
        }
        result.append(m_dict)
    
    return result

from app.schemas.match import MatchOverrideRequest, ApproveForwardingRequest
from app.models.audit import AuditLog
from app.services.notifications import notify_company_cvs_forwarded
from app.models.match import MatchForwardingStatus

@router.patch("/{id}/override", response_model=MatchOut)
def override_match(
    id: UUID,
    request: MatchOverrideRequest,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    match = db.query(Match).filter(Match.id == id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    old_data = {
        "skill_score": match.skill_score,
        "hard_filter_passed": match.hard_filter_passed,
        "included_in_shortlist": match.included_in_shortlist,
        "forwarding_status": match.forwarding_status.value
    }
    
    if request.skill_score is not None:
        match.skill_score = request.skill_score
    if request.hard_filter_passed is not None:
        match.hard_filter_passed = request.hard_filter_passed
    if request.included_in_shortlist is not None:
        match.included_in_shortlist = request.included_in_shortlist
    if request.forwarding_status is not None:
        try:
            match.forwarding_status = MatchForwardingStatus(request.forwarding_status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid forwarding_status")
            
    db.add(match)
    
    # Create audit log
    audit_log = AuditLog(
        actor_user_id=UUID(token.sub),
        action="override_match",
        entity_type="Match",
        entity_id=match.id,
        metadata_info={"old_data": old_data, "new_data": request.dict(exclude_unset=True)}
    )
    db.add(audit_log)
    db.commit()
    db.refresh(match)
    
    m_dict = {
        "id": match.id,
        "job_id": match.job_id,
        "student_id": match.student_id,
        "application_id": match.application_id,
        "skill_score": match.skill_score,
        "hard_filter_passed": match.hard_filter_passed,
        "included_in_shortlist": match.included_in_shortlist,
        "forwarding_status": match.forwarding_status.value,
        "created_at": match.created_at,
        "updated_at": match.updated_at,
        "student": match.student,
        "student_skills": match.student.cv.skills if (match.student and match.student.cv and match.student.cv.skills) else []
    }
    return m_dict

@router.post("/{job_id}/approve-forwarding")
def approve_forwarding(
    job_id: UUID,
    request: ApproveForwardingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    matches = db.query(Match).filter(
        Match.id.in_(request.match_ids),
        Match.job_id == job_id
    ).all()
    
    if not matches:
        raise HTTPException(status_code=404, detail="No matches found to approve")
        
    for match in matches:
        if match.forwarding_status != MatchForwardingStatus.sent:
            match.forwarding_status = MatchForwardingStatus.sent
            db.add(match)
            
            # Create audit log per approval
            audit_log = AuditLog(
                actor_user_id=UUID(token.sub),
                action="approve_forwarding",
                entity_type="Match",
                entity_id=match.id,
                metadata_info={"job_id": str(job_id)}
            )
            db.add(audit_log)
            
    db.commit()
    
    notify_company_cvs_forwarded(db, job, str(job.company_id), len(matches), background_tasks)
    
    return {"message": f"Approved {len(matches)} matches for forwarding"}

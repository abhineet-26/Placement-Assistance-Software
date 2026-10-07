from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.models.users import User, RoleEnum
from app.models.job import JobRequirement, JobStatusEnum
from app.models.audit import AuditLog
from app.schemas.job import JobRequirementCreate, JobRequirementOut, JobRequirementReturn
from app.core.auth import get_current_user, require_role, require_approved_company
from app.schemas.auth import TokenPayload
from app.services.notifications import notify_eligible_students_job_published

router = APIRouter()

@router.post("/", response_model=JobRequirementOut, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobRequirementCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_approved_company)
):
    job = JobRequirement(
        company_id=user.company.id,
        **job_in.model_dump(),
        status=JobStatusEnum.pending_review
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=List[JobRequirementOut])
def get_jobs(
    status_filter: Optional[JobStatusEnum] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(JobRequirement)
    
    if user.role == RoleEnum.student:
        # Students only see published jobs
        query = query.filter(JobRequirement.status == JobStatusEnum.published)
    elif user.role == RoleEnum.company:
        # Companies only see their own jobs
        if not user.company:
            return []
        query = query.filter(JobRequirement.company_id == user.company.id)
        if status_filter:
            query = query.filter(JobRequirement.status == status_filter)
    elif user.role == RoleEnum.admin:
        # Admin can see all, filterable
        if status_filter:
            query = query.filter(JobRequirement.status == status_filter)
            
    return query.all()

@router.patch("/{id}/approve", response_model=JobRequirementOut)
def approve_job(
    id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    job = db.query(JobRequirement).filter(JobRequirement.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.status = JobStatusEnum.published
    job.reviewed_by = user.admin.id
    
    # Audit log
    audit = AuditLog(
        actor_user_id=user.id,
        action="job.approve",
        entity_type="job",
        entity_id=job.id
    )
    db.add(audit)
    db.commit()
    db.refresh(job)
    
    notify_eligible_students_job_published(db, job, background_tasks)
    
    return job

@router.patch("/{id}/return", response_model=JobRequirementOut)
def return_job(
    id: UUID,
    payload: JobRequirementReturn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    job = db.query(JobRequirement).filter(JobRequirement.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.status = JobStatusEnum.returned
    job.review_comment = payload.review_comment
    job.reviewed_by = user.admin.id
    
    # Audit log
    audit = AuditLog(
        actor_user_id=user.id,
        action="job.return",
        entity_type="job",
        entity_id=job.id,
        metadata_info={"review_comment": payload.review_comment}
    )
    db.add(audit)
    db.commit()
    db.refresh(job)
    return job

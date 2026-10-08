from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.auth import require_role
from app.schemas.auth import TokenPayload
from app.models.users import Company, ApprovalStatusEnum, Student, PlacementStatusEnum
from app.models.job import JobRequirement, JobStatusEnum
from app.models.feedback import Feedback
from app.models.audit import AuditLog
from app.models.application import Application, ApplicationStatusEnum
from app.models.interview import Interview
from app.models.offer import Offer
from app.schemas.admin_reports import AdminQueueSummaryOut, PlacementStatsOut
from app.schemas.audit import AuditLogOut
from app.schemas.student import Student as StudentOut
from app.schemas.interview import InterviewOut
from app.schemas.offer import OfferOut


class AdminApplicationOut(BaseModel):
    id: UUID
    student_id: UUID
    student_name: str
    job_id: UUID
    job_title: str
    company_name: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


router = APIRouter()

@router.get("/queues/summary", response_model=AdminQueueSummaryOut)
def get_queue_summary(
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    pending_companies = db.query(Company).filter(Company.approval_status == ApprovalStatusEnum.pending).count()
    pending_jobs = db.query(JobRequirement).filter(JobRequirement.status == JobStatusEnum.pending_review).count()
    flagged_feedback = db.query(Feedback).filter(Feedback.flagged == True).count()
    
    return AdminQueueSummaryOut(
        pending_companies=pending_companies,
        pending_jobs=pending_jobs,
        flagged_feedback=flagged_feedback
    )

@router.get("/reports/placement-stats", response_model=PlacementStatsOut)
def get_placement_stats(
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    total_students = db.query(Student).count()
    total_companies = db.query(Company).count()
    total_jobs = db.query(JobRequirement).count()
    total_applications = db.query(Application).count()
    
    total_placed_students = db.query(Student).filter(Student.placement_status == PlacementStatusEnum.placed).count()
    
    students_by_status = {}
    for status in PlacementStatusEnum:
        count = db.query(Student).filter(Student.placement_status == status).count()
        students_by_status[status.value] = count
        
    return PlacementStatsOut(
        total_students=total_students,
        total_companies=total_companies,
        total_jobs=total_jobs,
        total_applications=total_applications,
        total_placed_students=total_placed_students,
        students_by_status=students_by_status
    )

@router.get("/audit-log", response_model=List[AuditLogOut])
def get_audit_log(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs

@router.get("/students", response_model=List[StudentOut])
def get_students(
    skip: int = 0,
    limit: int = 50,
    status: Optional[PlacementStatusEnum] = None,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    query = db.query(Student)
    if status:
        query = query.filter(Student.placement_status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/applications", response_model=List[AdminApplicationOut])
def get_applications(
    skip: int = 0,
    limit: int = 50,
    status: Optional[ApplicationStatusEnum] = None,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    query = db.query(Application)
    if status:
        query = query.filter(Application.status == status)
    applications = query.offset(skip).limit(limit).all()
    result = []
    for app in applications:
        company_name = app.job.company.company_name if app.job and app.job.company else "Unknown"
        result.append({
            "id": app.id,
            "student_id": app.student_id,
            "student_name": app.student.full_name if app.student else "Unknown",
            "job_id": app.job_id,
            "job_title": app.job.title if app.job else "Unknown",
            "company_name": company_name,
            "status": app.status.value if hasattr(app.status, "value") else str(app.status),
            "created_at": app.created_at,
            "updated_at": app.updated_at
        })
    return result

@router.get("/interviews", response_model=List[InterviewOut])
def get_interviews(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    return db.query(Interview).offset(skip).limit(limit).all()

@router.get("/offers", response_model=List[OfferOut])
def get_offers(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    return db.query(Offer).offset(skip).limit(limit).all()

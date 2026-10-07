from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.core.auth import require_role
from app.schemas.auth import TokenPayload
from app.models.users import Company, ApprovalStatusEnum, Student, PlacementStatusEnum
from app.models.job import JobRequirement, JobStatusEnum
from app.models.feedback import Feedback
from app.models.audit import AuditLog
from app.models.application import Application
from app.schemas.admin_reports import AdminQueueSummaryOut, PlacementStatsOut
from app.schemas.audit import AuditLogOut

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

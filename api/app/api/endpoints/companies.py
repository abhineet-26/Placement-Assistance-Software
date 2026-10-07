from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.models.users import Company, ApprovalStatusEnum, User
from app.models.audit import AuditLog
from app.schemas.company import CompanyOut, CompanyUpdate
from app.core.auth import get_current_user, require_role
from app.schemas.auth import TokenPayload

router = APIRouter()

@router.get("/", response_model=List[CompanyOut])
def get_companies(
    status: Optional[ApprovalStatusEnum] = None,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    query = db.query(Company)
    if status:
        query = query.filter(Company.approval_status == status)
    return query.all()

@router.patch("/{id}/approve", response_model=CompanyOut)
def approve_company(
    id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.approval_status = ApprovalStatusEnum.approved
    
    # Audit Log
    audit = AuditLog(
        actor_user_id=user.id,
        action="company.approve",
        entity_type="company",
        entity_id=company.id
    )
    db.add(audit)
    db.commit()
    db.refresh(company)
    return company

@router.patch("/{id}/reject", response_model=CompanyOut)
def reject_company(
    id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    token: TokenPayload = Depends(require_role(["admin"]))
):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.approval_status = ApprovalStatusEnum.rejected
    
    # Audit Log
    audit = AuditLog(
        actor_user_id=user.id,
        action="company.reject",
        entity_type="company",
        entity_id=company.id
    )
    db.add(audit)
    db.commit()
    db.refresh(company)
    return company

# Adding GET /companies/me to view own company profile
@router.get("/me", response_model=CompanyOut)
def get_my_company(
    user: User = Depends(get_current_user),
    token: TokenPayload = Depends(require_role(["company"]))
):
    if not user.company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return user.company

from app.models.match import Match, MatchForwardingStatus
from app.models.job import JobRequirement
from app.schemas.match import MatchWithCVOut

@router.get("/me/received-cvs", response_model=List[MatchWithCVOut])
def get_received_cvs(
    job_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    token: TokenPayload = Depends(require_role(["company"]))
):
    if not user.company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    
    query = db.query(Match).join(JobRequirement).filter(
        JobRequirement.company_id == user.company.id,
        Match.forwarding_status == MatchForwardingStatus.sent
    )
    
    if job_id:
        query = query.filter(JobRequirement.id == job_id)
        
    matches = query.all()
    
    result = []
    for m in matches:
        cv_detail = None
        if m.student and m.student.cv:
            cv_detail = {
                "id": m.student.cv.id,
                "summary": m.student.cv.summary,
                "academic_record": m.student.cv.academic_record,
                "skills": m.student.cv.skills,
                "projects": m.student.cv.projects,
                "certifications": m.student.cv.certifications,
            }
            
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
            "student_skills": m.student.cv.skills if (m.student and m.student.cv and m.student.cv.skills) else [],
            "student_cv": cv_detail
        }
        result.append(m_dict)
    
    return result

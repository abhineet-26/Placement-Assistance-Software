from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime, timezone
import uuid

from app.db.session import get_db
from app.core.auth import get_current_user, require_role
from app.models.users import User, RoleEnum
from app.models.job import JobRequirement, JobStatusEnum
from app.models.application import Application, ApplicationStatusEnum
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationWithJob, ApplicationStatusUpdate
from app.services.matching import run_matching_for_job

router = APIRouter()

@router.post("/", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    application_in: ApplicationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    _ = Depends(require_role(["student"]))
):
    student = user.student
    if not student:
        raise HTTPException(status_code=400, detail="User is not a student")

    if not student.cv:
        raise HTTPException(status_code=400, detail="You must upload a CV before applying")

    job = db.query(JobRequirement).filter(JobRequirement.id == application_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.status != JobStatusEnum.published:
        raise HTTPException(status_code=400, detail="Job is not published")

    if job.application_deadline < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Application deadline has passed")

    # Eligibility Checks
    if job.min_cgpa is not None:
        student_cgpa = student.cgpa or 0.0
        if float(student_cgpa) < float(job.min_cgpa):
            raise HTTPException(status_code=400, detail="Not eligible: CGPA too low")

    if job.allowed_branches and len(job.allowed_branches) > 0:
        if student.branch not in job.allowed_branches:
            raise HTTPException(status_code=400, detail=f"Not eligible: Branch {student.branch} not allowed")

    if job.max_backlogs is not None:
        student_backlogs = student.backlogs or 0
        if student_backlogs > job.max_backlogs:
            raise HTTPException(status_code=400, detail="Not eligible: Too many backlogs")

    app_record = Application(
        student_id=student.id,
        job_id=job.id,
        status=ApplicationStatusEnum.applied
    )
    db.add(app_record)
    
    try:
        db.commit()
        db.refresh(app_record)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    background_tasks.add_task(run_matching_for_job, db, job.id)

    return app_record

@router.get("/me", response_model=List[ApplicationWithJob])
def get_my_applications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    _ = Depends(require_role(["student"]))
):
    student = user.student
    if not student:
        raise HTTPException(status_code=400, detail="User is not a student")
        
    applications = db.query(Application).filter(Application.student_id == student.id).order_by(Application.created_at.desc()).all()
    
    result = []
    for app in applications:
        job = app.job
        app_dict = {
            "id": app.id,
            "student_id": app.student_id,
            "job_id": app.job_id,
            "status": app.status,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "job_summary": {
                "id": job.id,
                "title": job.title,
                "company_name": job.company.company_name
            } if job else None
        }
        result.append(app_dict)
        
    return result

@router.patch("/{id}/withdraw", response_model=ApplicationRead)
def withdraw_application(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    _ = Depends(require_role(["student"]))
):
    student = user.student
    if not student:
        raise HTTPException(status_code=400, detail="User is not a student")

    app_record = db.query(Application).filter(Application.id == id, Application.student_id == student.id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if app_record.status not in [ApplicationStatusEnum.applied, ApplicationStatusEnum.interview_scheduled]:
        raise HTTPException(status_code=400, detail="Cannot withdraw application at this stage")
        
    app_record.status = ApplicationStatusEnum.withdrawn
    db.commit()
    db.refresh(app_record)
    
    return app_record

@router.patch("/{id}/status", response_model=ApplicationRead)
def update_application_status(
    id: uuid.UUID,
    status_update: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    _ = Depends(require_role(["company", "admin"]))
):
    app_record = db.query(Application).filter(Application.id == id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if user.role == RoleEnum.company:
        job = app_record.job
        if not user.company or job.company_id != user.company.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this application")
    
    app_record.status = status_update.status
    db.commit()
    db.refresh(app_record)
    
    return app_record


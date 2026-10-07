from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth import get_current_user
from app.models.users import User
from app.models.cv import CV as CVModel, CVVersion as CVVersionModel
from app.schemas.cv import CV, CVUpdate, CVVersion
from typing import Any, List

router = APIRouter()

@router.get("/me", response_model=CV)
def get_cv_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current student's CV.
    """
    if current_user.role.value != "student":
        raise HTTPException(status_code=403, detail="Not a student")
        
    student = current_user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    if not student.cv:
        raise HTTPException(status_code=404, detail="CV not found")
        
    return student.cv

@router.put("/me", response_model=CV)
def update_cv_me(
    *,
    db: Session = Depends(get_db),
    cv_in: CVUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update or create current student's CV (Overwrites existing CV content, but saves version).
    """
    if current_user.role.value != "student":
        raise HTTPException(status_code=403, detail="Not a student")
        
    student = current_user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    cv = student.cv
    if not cv:
        cv = CVModel(student_id=student.id)
        db.add(cv)
    
    update_data = cv_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cv, field, value)
        
    if not cv.id:
        db.flush() # flush to get cv.id
        version_num = 1
    else:
        last_version = db.query(CVVersionModel).filter(CVVersionModel.student_id == student.id).order_by(CVVersionModel.version.desc()).first()
        version_num = (last_version.version + 1) if last_version else 2
        cv.version = version_num

    # Save version
    cv_version = CVVersionModel(
        student_id=student.id,
        snapshot=cv_in.model_dump(),
        version=version_num
    )
    db.add(cv_version)
    
    db.commit()
    db.refresh(cv)
    return cv

@router.get("/me/versions", response_model=List[CVVersion])
def get_cv_me_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current student's CV versions.
    """
    if current_user.role.value != "student":
        raise HTTPException(status_code=403, detail="Not a student")
        
    student = current_user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    versions = db.query(CVVersionModel).filter(CVVersionModel.student_id == student.id).order_by(CVVersionModel.version.desc()).all()
    return versions

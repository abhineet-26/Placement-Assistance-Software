from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth import get_current_user, require_role, TokenPayload
from app.models.users import User
from app.schemas.student import Student, StudentUpdate
from typing import Any

router = APIRouter()

@router.get("/me", response_model=Student)
def get_student_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current student profile.
    """
    if current_user.role.value != "student":
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = current_user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    return student

@router.patch("/me", response_model=Student)
def update_student_me(
    *,
    db: Session = Depends(get_db),
    student_in: StudentUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update current student profile.
    """
    if current_user.role.value != "student":
        raise HTTPException(status_code=403, detail="Not a student")
        
    student = current_user.student
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
        
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

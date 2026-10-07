from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class StudentBase(BaseModel):
    full_name: str
    roll_number: str
    phone: Optional[str] = None
    programme: Optional[str] = None
    branch: Optional[str] = None
    batch_year: Optional[int] = None
    cgpa: Optional[float] = None
    backlogs: Optional[int] = 0

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    programme: Optional[str] = None
    branch: Optional[str] = None
    batch_year: Optional[int] = None
    cgpa: Optional[float] = None
    backlogs: Optional[int] = None

class StudentInDBBase(StudentBase):
    id: UUID
    user_id: UUID
    enrollment_status: str
    placement_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Student(StudentInDBBase):
    pass

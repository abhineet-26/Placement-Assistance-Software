from pydantic import BaseModel, conlist, Field
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.job import JobStatusEnum

class JobRequirementBase(BaseModel):
    title: str = Field(..., description="Title of the job")
    description: str = Field(..., description="Detailed description of the job")
    required_skills: List[str] = Field(..., min_length=1, description="At least one required skill")
    min_cgpa: Optional[float] = None
    allowed_branches: Optional[List[str]] = None
    max_backlogs: Optional[int] = None
    vacancies: int = Field(..., gt=0, description="Must be greater than zero")
    application_deadline: datetime = Field(..., description="Application deadline")

class JobRequirementCreate(JobRequirementBase):
    pass

class JobRequirementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    min_cgpa: Optional[float] = None
    allowed_branches: Optional[List[str]] = None
    max_backlogs: Optional[int] = None
    vacancies: Optional[int] = None
    application_deadline: Optional[datetime] = None

class JobRequirementReturn(BaseModel):
    review_comment: str = Field(..., min_length=1, description="Reason for returning the job")

class JobRequirementOut(JobRequirementBase):
    id: uuid.UUID
    company_id: uuid.UUID
    status: JobStatusEnum
    review_comment: Optional[str] = None
    reviewed_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

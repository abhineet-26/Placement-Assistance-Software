from pydantic import BaseModel, UUID4, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.application import ApplicationStatusEnum

class ApplicationBase(BaseModel):
    job_id: UUID4

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatusEnum

class JobSummary(BaseModel):
    id: UUID4
    title: str
    company_name: str

    model_config = ConfigDict(from_attributes=True)

class ApplicationRead(ApplicationBase):
    id: UUID4
    student_id: UUID4
    status: ApplicationStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApplicationWithJob(ApplicationRead):
    job_summary: Optional[JobSummary] = None

    model_config = ConfigDict(from_attributes=True)

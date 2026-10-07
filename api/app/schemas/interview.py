from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Any, Dict
from app.models.interview import InterviewStatusEnum

class InterviewBase(BaseModel):
    application_id: UUID4
    scheduled_at: datetime
    location_or_mode: str

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    location_or_mode: Optional[str] = None
    status: Optional[InterviewStatusEnum] = None

class InterviewOut(InterviewBase):
    id: UUID4
    status: InterviewStatusEnum
    created_by: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

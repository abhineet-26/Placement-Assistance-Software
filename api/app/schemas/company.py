from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.models.users import ApprovalStatusEnum

class CompanyOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    company_name: str
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    about: Optional[str] = None
    approval_status: ApprovalStatusEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    about: Optional[str] = None

from pydantic import BaseModel
from typing import Any, Dict, Optional
from uuid import UUID
from datetime import datetime

class PolicySettingsBase(BaseModel):
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None
    is_active: bool = True

class PolicySettingsCreate(PolicySettingsBase):
    pass

class PolicySettingsUpdate(BaseModel):
    value: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class PolicySettingsOut(PolicySettingsBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

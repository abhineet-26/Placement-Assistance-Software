from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
import uuid

class AuditLogOut(BaseModel):
    id: uuid.UUID
    actor_user_id: uuid.UUID
    action: str
    entity_type: str
    entity_id: uuid.UUID
    metadata_info: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from uuid import UUID
from datetime import datetime
from app.models.notification import NotificationType, NotificationChannel, NotificationStatus

class NotificationBase(BaseModel):
    type: NotificationType
    payload: Optional[dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    recipient_user_id: UUID

class NotificationOut(NotificationBase):
    id: UUID
    read_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class NotificationLogOut(BaseModel):
    id: UUID
    notification_id: Optional[UUID] = None
    channel: NotificationChannel
    recipient_email: str
    status: NotificationStatus
    attempt_count: int
    last_error: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

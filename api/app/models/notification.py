import enum
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base_class import Base

class NotificationType(str, enum.Enum):
    new_opportunity = "new_opportunity"
    interview_scheduled = "interview_scheduled"
    offer_received = "offer_received"
    status_change = "status_change"
    company_approved = "company_approved"
    job_returned = "job_returned"
    cvs_forwarded = "cvs_forwarded"

class NotificationChannel(str, enum.Enum):
    email = "email"

class NotificationStatus(str, enum.Enum):
    queued = "queued"
    sent = "sent"
    failed = "failed"
    retrying = "retrying"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    recipient_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    payload = Column(JSONB, nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NotificationLog(Base):
    __tablename__ = "notification_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    notification_id = Column(UUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=True)
    channel = Column(SQLEnum(NotificationChannel), nullable=False, default=NotificationChannel.email)
    recipient_email = Column(String, nullable=False)
    status = Column(SQLEnum(NotificationStatus), nullable=False, default=NotificationStatus.queued)
    attempt_count = Column(Integer, default=0, nullable=False)
    last_error = Column(String, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

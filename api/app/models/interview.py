import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class InterviewStatusEnum(str, enum.Enum):
    scheduled = "scheduled"
    rescheduled = "rescheduled"
    completed = "completed"
    cancelled = "cancelled"

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    location_or_mode = Column(String, nullable=False)
    status = Column(Enum(InterviewStatusEnum), default=InterviewStatusEnum.scheduled, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("admins.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    application = relationship("Application", backref="interviews")
    admin = relationship("Admin")

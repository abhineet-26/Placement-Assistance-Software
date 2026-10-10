import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base


class AuthorTypeEnum(str, enum.Enum):
    student = "student"
    company = "company"


class TargetTypeEnum(str, enum.Enum):
    company = "company"
    student = "student"
    interview = "interview"
    job = "job"
    platform = "platform"


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_type = Column(Enum(AuthorTypeEnum), nullable=False)
    author_id = Column(UUID(as_uuid=True), nullable=False)
    target_type = Column(Enum(TargetTypeEnum), nullable=False)
    target_id = Column(UUID(as_uuid=True), nullable=True)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)  # 1-5, optional
    flagged = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Numeric, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class JobStatusEnum(str, enum.Enum):
    draft = "draft"
    pending_review = "pending_review"
    published = "published"
    returned = "returned"
    closed = "closed"

class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(ARRAY(String), nullable=False, default=list)
    min_cgpa = Column(Numeric(3, 2), nullable=True)
    allowed_branches = Column(ARRAY(String), nullable=True)
    max_backlogs = Column(Integer, nullable=True)
    vacancies = Column(Integer, nullable=False)
    application_deadline = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(JobStatusEnum), default=JobStatusEnum.draft, nullable=False)
    review_comment = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("admins.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", backref="job_requirements")
    reviewer = relationship("Admin", backref="reviewed_jobs")

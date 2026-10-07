import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Boolean, Float, UniqueConstraint, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class MatchForwardingStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"

class Match(Base):
    __tablename__ = "matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_requirements.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    
    skill_score = Column(Float, nullable=False, default=0.0)
    hard_filter_passed = Column(Boolean, nullable=False, default=False)
    included_in_shortlist = Column(Boolean, nullable=False, default=False)
    forwarding_status = Column(Enum(MatchForwardingStatus), default=MatchForwardingStatus.pending, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('job_id', 'student_id', name='uq_match_job_student'),
    )

    # Relationships
    job = relationship("JobRequirement", backref="matches")
    student = relationship("Student", backref="matches")
    application = relationship("Application", backref="match")

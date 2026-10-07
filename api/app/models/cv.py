from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, JSON, func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.base_class import Base

class CV(Base):
    __tablename__ = "cvs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), unique=True, nullable=False)
    summary = Column(String, nullable=True)
    academic_record = Column(JSONB, nullable=True)
    skills = Column(ARRAY(String), nullable=True)
    projects = Column(JSONB, nullable=True)
    certifications = Column(JSONB, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    is_valid = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student = relationship("Student", back_populates="cv")


class CVVersion(Base):
    __tablename__ = "cv_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    snapshot = Column(JSONB, nullable=False)
    version = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

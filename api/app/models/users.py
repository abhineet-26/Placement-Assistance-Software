import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Numeric, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base

class RoleEnum(str, enum.Enum):
    student = "student"
    company = "company"
    admin = "admin"
    super_admin = "super_admin"
    faculty_coordinator = "faculty_coordinator"
    student_representative = "student_representative"

class EnrollmentStatusEnum(str, enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"

class PlacementStatusEnum(str, enum.Enum):
    not_placed = "not_placed"
    applied = "applied"
    interview_scheduled = "interview_scheduled"
    offer_received = "offer_received"
    placed = "placed"

class ApprovalStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    suspended = "suspended"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="user", uselist=False)
    company = relationship("Company", back_populates="user", uselist=False)
    admin = relationship("Admin", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    roll_number = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    programme = Column(String)
    branch = Column(String)
    batch_year = Column(Integer)
    cgpa = Column(Numeric(3, 2))
    backlogs = Column(Integer, default=0)
    enrollment_status = Column(Enum(EnrollmentStatusEnum), default=EnrollmentStatusEnum.active)
    placement_status = Column(Enum(PlacementStatusEnum), default=PlacementStatusEnum.not_placed)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="student")
    cv = relationship("CV", back_populates="student", uselist=False)

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    company_name = Column(String, nullable=False)
    contact_person = Column(String)
    contact_phone = Column(String)
    about = Column(Text)
    approval_status = Column(Enum(ApprovalStatusEnum), default=ApprovalStatusEnum.pending)
    flagged_duplicate_of = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="company")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="admin")

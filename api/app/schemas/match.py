from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class StudentMatchSummary(BaseModel):
    id: UUID
    roll_number: str
    full_name: str
    cgpa: Optional[float] = None
    branch: Optional[str] = None
    backlogs: int
    gender: Optional[str] = None

class MatchBase(BaseModel):
    job_id: UUID
    student_id: UUID
    skill_score: float
    hard_filter_passed: bool
    included_in_shortlist: bool
    forwarding_status: str

class MatchOut(MatchBase):
    id: UUID
    application_id: UUID
    created_at: datetime
    updated_at: datetime
    student: StudentMatchSummary
    student_skills: List[str] = []
    
    class Config:
        from_attributes = True

class MatchOverrideRequest(BaseModel):
    skill_score: Optional[float] = None
    hard_filter_passed: Optional[bool] = None
    included_in_shortlist: Optional[bool] = None
    forwarding_status: Optional[str] = None
    
class ApproveForwardingRequest(BaseModel):
    match_ids: List[UUID]

class CVDetailOut(BaseModel):
    id: UUID
    summary: Optional[str] = None
    academic_record: Optional[dict] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None

class MatchWithCVOut(MatchOut):
    student_cv: Optional[CVDetailOut] = None

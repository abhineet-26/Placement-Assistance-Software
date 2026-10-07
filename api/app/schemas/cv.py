from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class CVBase(BaseModel):
    summary: Optional[str] = None
    academic_record: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = None
    projects: Optional[Dict[str, Any]] = None
    certifications: Optional[Dict[str, Any]] = None

class CVCreate(CVBase):
    pass

class CVUpdate(CVBase):
    pass

class CVInDBBase(CVBase):
    id: UUID
    student_id: UUID
    version: int
    is_valid: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CV(CVInDBBase):
    pass

class CVVersionBase(BaseModel):
    snapshot: Dict[str, Any]
    version: int

class CVVersionInDBBase(CVVersionBase):
    id: UUID
    student_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CVVersion(CVVersionInDBBase):
    pass

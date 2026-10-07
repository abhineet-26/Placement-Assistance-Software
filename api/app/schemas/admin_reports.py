from pydantic import BaseModel
from typing import Dict, List, Any
from uuid import UUID
from datetime import datetime

class AdminQueueSummaryOut(BaseModel):
    pending_companies: int
    pending_jobs: int
    flagged_feedback: int

class PlacementStatsOut(BaseModel):
    total_students: int
    total_companies: int
    total_jobs: int
    total_applications: int
    total_placed_students: int
    students_by_status: Dict[str, int]

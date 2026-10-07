from pydantic import BaseModel, UUID4, field_validator
from datetime import datetime
from typing import Optional
from app.models.feedback import AuthorTypeEnum, TargetTypeEnum


class FeedbackCreate(BaseModel):
    target_type: TargetTypeEnum
    target_id: UUID4
    content: str
    rating: Optional[int] = None

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("content must not be blank (R.8-E1)")
        return v.strip()

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 5):
            raise ValueError("rating must be between 1 and 5")
        return v


class FeedbackOut(BaseModel):
    id: UUID4
    author_type: AuthorTypeEnum
    author_id: UUID4
    target_type: TargetTypeEnum
    target_id: UUID4
    content: str
    rating: Optional[int]
    flagged: bool
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Any, Dict
from app.models.offer import OfferStatusEnum

class OfferBase(BaseModel):
    application_id: UUID4
    offer_details: Dict[str, Any]

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    offer_details: Optional[Dict[str, Any]] = None
    status: Optional[OfferStatusEnum] = None

class OfferDecision(BaseModel):
    status: OfferStatusEnum

class OfferOut(OfferBase):
    id: UUID4
    status: OfferStatusEnum
    created_by: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

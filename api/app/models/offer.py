import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class OfferStatusEnum(str, enum.Enum):
    extended = "extended"
    accepted = "accepted"
    declined = "declined"
    withdrawn = "withdrawn"

class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), unique=True, nullable=False)
    offer_details = Column(JSONB, nullable=False)
    status = Column(Enum(OfferStatusEnum), default=OfferStatusEnum.extended, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("admins.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    application = relationship("Application", backref="offer", uselist=False)
    admin = relationship("Admin")

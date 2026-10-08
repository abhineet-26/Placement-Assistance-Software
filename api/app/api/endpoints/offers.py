from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import UUID4
from app.db.session import get_db
from app.core.auth import get_current_user
from app.models.users import User, RoleEnum
from app.models.application import Application
from app.models.offer import Offer, OfferStatusEnum
from app.schemas.offer import OfferCreate, OfferUpdate, OfferDecision, OfferOut
from app.services.status import update_application_status
from app.services.notifications import notify_student_offer, notify_company_offer_decision
from app.models.audit import AuditLog

router = APIRouter()

@router.post("/", response_model=OfferOut, status_code=201)
def create_offer(
    *,
    db: Session = Depends(get_db),
    offer_in: OfferCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in [RoleEnum.admin, RoleEnum.company]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    application = db.query(Application).filter(Application.id == offer_in.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if current_user.role == RoleEnum.company and application.job.company_id != current_user.company.id:
        raise HTTPException(status_code=403, detail="Not authorized to make offers for this application")
        
    existing_offer = db.query(Offer).filter(Offer.application_id == offer_in.application_id).first()
    if existing_offer:
        raise HTTPException(status_code=400, detail="Offer already exists for this application")
        
    offer = Offer(
        application_id=offer_in.application_id,
        offer_details=offer_in.offer_details,
        created_by=current_user.id
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    
    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="offer.create",
        entity_type="offer",
        entity_id=offer.id,
        metadata_info={"application_id": str(application.id)}
    )
    db.add(audit)
    db.commit()

    # Update status
    update_application_status(db, application.id)
    
    # Notify student
    notify_student_offer(
        db=db,
        student_user=application.student.user,
        job_title=application.job.title,
        offer_details=offer_in.offer_details,
        status="extended",
        background_tasks=background_tasks
    )
    
    return offer

@router.patch("/{id}", response_model=OfferOut)
def update_offer(
    *,
    db: Session = Depends(get_db),
    id: UUID4,
    offer_in: OfferUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in [RoleEnum.admin, RoleEnum.company]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    offer = db.query(Offer).filter(Offer.id == id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    if current_user.role == RoleEnum.company and offer.application.job.company_id != current_user.company.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this offer")
        
    update_data = offer_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(offer, field, value)
        
    db.add(offer)
    db.commit()
    db.refresh(offer)
    
    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="offer.update",
        entity_type="offer",
        entity_id=offer.id,
        metadata_info=update_data
    )
    db.add(audit)
    db.commit()
    
    # Update status
    update_application_status(db, offer.application_id)
    
    # Notify student
    notify_student_offer(
        db=db,
        student_user=offer.application.student.user,
        job_title=offer.application.job.title,
        offer_details=offer.offer_details,
        status=offer.status.value,
        background_tasks=background_tasks
    )
    
    return offer

@router.patch("/{id}/decision", response_model=OfferOut)
def decide_offer(
    *,
    db: Session = Depends(get_db),
    id: UUID4,
    decision: OfferDecision,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role != RoleEnum.student:
        raise HTTPException(status_code=403, detail="Only the offer recipient can decide on an offer")
    if not current_user.student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    if decision.status not in [OfferStatusEnum.accepted, OfferStatusEnum.declined]:
        raise HTTPException(status_code=400, detail="Offer decision must be accepted or declined")

    offer = db.query(Offer).join(Application).filter(
        Offer.id == id,
        Application.student_id == current_user.student.id
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.status != OfferStatusEnum.extended:
        raise HTTPException(status_code=400, detail="Only an extended offer can be decided")

    offer.status = decision.status
    db.commit()
    db.refresh(offer)

    db.add(AuditLog(
        actor_user_id=current_user.id,
        action=f"offer.{decision.status.value}",
        entity_type="offer",
        entity_id=offer.id,
        metadata_info={"application_id": str(offer.application_id)}
    ))
    db.commit()

    update_application_status(db, offer.application_id)
    notify_company_offer_decision(
        db=db,
        company_user=offer.application.job.company.user,
        job_title=offer.application.job.title,
        status=decision.status.value,
        background_tasks=background_tasks
    )
    return offer

@router.get("/", response_model=List[OfferOut])
def list_offers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role == RoleEnum.admin:
        offers = db.query(Offer).offset(skip).limit(limit).all()
    elif current_user.role == RoleEnum.student:
        offers = db.query(Offer).join(Application).filter(
            Application.student_id == current_user.student.id
        ).offset(skip).limit(limit).all()
    elif current_user.role == RoleEnum.company:
        offers = db.query(Offer).join(Application).filter(
            Application.job.has(company_id=current_user.company.id)
        ).offset(skip).limit(limit).all()
    else:
        offers = []
        
    return offers

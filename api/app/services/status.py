from sqlalchemy.orm import Session
from pydantic import UUID4
from app.models.application import Application, ApplicationStatusEnum
from app.models.users import Student, PlacementStatusEnum
from app.models.interview import Interview, InterviewStatusEnum
from app.models.offer import Offer, OfferStatusEnum
from app.models.match import Match

def update_application_status(db: Session, application_id: UUID4):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        return None

    # If application is withdrawn or rejected, we generally don't escalate it, but 
    # to be safe, if there's an active offer, it overrides. Let's just calculate based on actual state.
    
    active_offer = db.query(Offer).filter(
        Offer.application_id == application_id, 
        Offer.status.in_([OfferStatusEnum.extended, OfferStatusEnum.accepted])
    ).first()
    
    new_status = application.status

    if active_offer:
        if active_offer.status == OfferStatusEnum.accepted:
            new_status = ApplicationStatusEnum.placed
        else:
            new_status = ApplicationStatusEnum.offer_received
    else:
        active_interview = db.query(Interview).filter(
            Interview.application_id == application_id, 
            Interview.status.in_([InterviewStatusEnum.scheduled, InterviewStatusEnum.rescheduled, InterviewStatusEnum.completed])
        ).first()
        
        if active_interview:
            new_status = ApplicationStatusEnum.interview_scheduled
        else:
            # Fallback to match status if no active interviews or offers
            if application.status not in [ApplicationStatusEnum.withdrawn, ApplicationStatusEnum.rejected]:
                match = db.query(Match).filter(Match.application_id == application_id).first()
                if match:
                    if match.forwarding_status == "sent":
                        new_status = ApplicationStatusEnum.cv_forwarded
                    elif match.included_in_shortlist:
                        new_status = ApplicationStatusEnum.shortlisted
                    else:
                        new_status = ApplicationStatusEnum.applied
                else:
                    new_status = ApplicationStatusEnum.applied

    application.status = new_status
    db.commit()
    db.refresh(application)
    
    update_student_placement_status(db, application.student_id)
    return application

def update_student_placement_status(db: Session, student_id: UUID4):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return

    apps = db.query(Application).filter(Application.student_id == student_id).all()
    
    if not apps:
        student.placement_status = PlacementStatusEnum.not_placed
        db.commit()
        return

    hierarchy = {
        ApplicationStatusEnum.placed: 5,
        ApplicationStatusEnum.offer_received: 4,
        ApplicationStatusEnum.interview_scheduled: 3,
        ApplicationStatusEnum.applied: 1,
        ApplicationStatusEnum.withdrawn: 0
    }
    
    max_level = 0
    for app in apps:
        level = hierarchy.get(app.status, 0)
        if level > max_level:
            max_level = level
            
    if max_level == 5:
        student.placement_status = PlacementStatusEnum.placed
    elif max_level == 4:
        student.placement_status = PlacementStatusEnum.offer_received
    elif max_level == 3:
        student.placement_status = PlacementStatusEnum.interview_scheduled
    elif max_level >= 1:
        student.placement_status = PlacementStatusEnum.applied
    else:
        student.placement_status = PlacementStatusEnum.not_placed
        
    db.commit()

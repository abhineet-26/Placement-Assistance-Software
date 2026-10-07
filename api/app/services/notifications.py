from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.models.users import User, RoleEnum, Student, Company
from app.models.job import JobRequirement
from app.services.email import dispatch_notification_task

def notify_eligible_students_job_published(db: Session, job: JobRequirement, background_tasks):
    # For now, let's notify all active students. Real logic might check hard filters.
    # In Phase 7 requirements: "job published -> notify eligible students"
    # To determine eligibility without duplicating matching logic, 
    # we can just query students that meet min_cgpa and max_backlogs.
    query = db.query(User).join(Student).filter(
        User.role == RoleEnum.student,
        User.is_active == True,
    )
    if job.min_cgpa is not None:
        query = query.filter(Student.cgpa >= job.min_cgpa)
    if job.max_backlogs is not None:
        query = query.filter(Student.backlogs <= job.max_backlogs)
        
    eligible_users = query.all()
    
    for user in eligible_users:
        # Create notification
        notif = Notification(
            recipient_user_id=user.id,
            type=NotificationType.new_opportunity,
            payload={"job_id": str(job.id), "job_title": job.title}
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        
        # Schedule email
        background_tasks.add_task(
            dispatch_notification_task,
            str(notif.id),
            user.email,
            "New Job Opportunity",
            f"A new job has been published: {job.title}. Log in to apply."
        )

def notify_company_cvs_forwarded(db: Session, job: JobRequirement, company_id: str, match_count: int, background_tasks):
    company_user = db.query(User).filter(User.id == company_id).first()
    if not company_user:
        return
        
    notif = Notification(
        recipient_user_id=company_user.id,
        type=NotificationType.cvs_forwarded,
        payload={"job_id": str(job.id), "job_title": job.title, "cv_count": match_count}
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    background_tasks.add_task(
        dispatch_notification_task,
        str(notif.id),
        company_user.email,
        "New CVs Received",
        f"You have received {match_count} new CVs for {job.title}."
    )

def notify_student_interview(db: Session, student_user: User, job_title: str, scheduled_at: str, location: str, background_tasks):
    notif = Notification(
        recipient_user_id=student_user.id,
        type=NotificationType.interview_scheduled,
        payload={"job_title": job_title, "scheduled_at": scheduled_at, "location": location}
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    background_tasks.add_task(
        dispatch_notification_task,
        str(notif.id),
        student_user.email,
        "Interview Scheduled",
        f"An interview for {job_title} has been scheduled on {scheduled_at} at {location}."
    )

def notify_student_offer(db: Session, student_user: User, job_title: str, offer_details: dict, status: str, background_tasks):
    notif = Notification(
        recipient_user_id=student_user.id,
        type=NotificationType.offer_received,
        payload={"job_title": job_title, "offer_details": offer_details, "status": status}
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    background_tasks.add_task(
        dispatch_notification_task,
        str(notif.id),
        student_user.email,
        "Offer Update",
        f"Your offer for {job_title} has been updated to {status}."
    )

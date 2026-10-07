from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timezone
import asyncio

from app.db.session import get_db
from app.core.auth import get_current_user, require_role
from app.schemas.auth import TokenPayload
from app.models.users import RoleEnum, User
from app.models.notification import Notification, NotificationLog, NotificationStatus
from app.schemas.notification import NotificationOut
from app.services.email import _dispatch_async

router = APIRouter()

@router.get("/me", response_model=List[NotificationOut])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = db.query(Notification)\
        .filter(Notification.recipient_user_id == current_user.id)\
        .order_by(Notification.created_at.desc())\
        .all()
    return notifications

@router.post("/{id}/read")
def mark_notification_read(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(Notification.id == id, Notification.recipient_user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "ok"}

@router.post("/admin/{id}/resend")
def resend_notification_admin(
    id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    token: TokenPayload = Depends(require_role([RoleEnum.admin.value]))
):
    notification = db.query(Notification).filter(Notification.id == id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    log_entry = db.query(NotificationLog).filter(
        NotificationLog.notification_id == id,
        NotificationLog.status == NotificationStatus.failed
    ).order_by(NotificationLog.created_at.desc()).first()
    
    if not log_entry:
        raise HTTPException(status_code=400, detail="No failed log found to resend")
    
    subject = f"Notification: {notification.type}"
    content = f"You have a new notification of type {notification.type}."
    
    if notification.type.name == "new_opportunity":
        subject = "New Job Opportunity"
        title = notification.payload.get('job_title', 'Unknown') if notification.payload else 'Unknown'
        content = f"A new job has been published: {title}"
    elif notification.type.name == "cvs_forwarded":
        subject = "New CVs Received"
        title = notification.payload.get('job_title', 'Unknown') if notification.payload else 'Unknown'
        count = notification.payload.get('cv_count', 0) if notification.payload else 0
        content = f"You have received {count} new CVs for {title}."

    def run_resend():
        asyncio.run(_dispatch_async(
            notification_id=str(notification.id),
            recipient_email=log_entry.recipient_email,
            subject=subject,
            content=content,
            is_resend=True,
            existing_log_id=str(log_entry.id)
        ))

    background_tasks.add_task(run_resend)
    return {"status": "resend_queued"}

import logging
import asyncio
import os
from datetime import datetime, timezone
from email.message import EmailMessage
import aiosmtplib
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.notification import Notification, NotificationLog, NotificationStatus, NotificationChannel

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "mailhog")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
MAX_RETRIES = 3
BACKOFF_BASE = 2 # seconds

async def send_email_async(to_email: str, subject: str, content: str):
    message = EmailMessage()
    message["From"] = "noreply@placement-assistant.local"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(content)
    
    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
    )

def dispatch_notification_task(
    notification_id: str,
    recipient_email: str,
    subject: str,
    content: str
):
    """
    Background task to handle sending and retrying logic, and updating notification_log.
    Because FastAPI BackgroundTasks run in the thread pool, we run the async dispatch here.
    """
    try:
        # FastAPI might already be running an event loop, 
        # so asyncio.run might fail if called from within a running loop.
        # But BackgroundTasks run in a separate thread, so it should be fine.
        asyncio.run(_dispatch_async(notification_id, recipient_email, subject, content))
    except RuntimeError:
        # fallback if loop exists
        loop = asyncio.get_event_loop()
        loop.create_task(_dispatch_async(notification_id, recipient_email, subject, content))

async def _dispatch_async(
    notification_id: str,
    recipient_email: str,
    subject: str,
    content: str,
    is_resend: bool = False,
    existing_log_id: str = None
):
    db: Session = SessionLocal()
    try:
        if is_resend and existing_log_id:
            log_entry = db.query(NotificationLog).filter(NotificationLog.id == existing_log_id).first()
            if not log_entry:
                return
            log_entry.status = NotificationStatus.queued
        else:
            log_entry = NotificationLog(
                notification_id=notification_id,
                channel=NotificationChannel.email,
                recipient_email=recipient_email,
                status=NotificationStatus.queued,
                attempt_count=0
            )
            db.add(log_entry)
        
        db.commit()
        db.refresh(log_entry)
        
        attempt = log_entry.attempt_count if is_resend else 0
        success = False
        last_err = ""
        
        # Max retries on top of existing attempts for resends, or total MAX_RETRIES?
        # Let's say we allow MAX_RETRIES per dispatch.
        max_attempts_this_run = MAX_RETRIES
        attempts_this_run = 0
        
        while attempts_this_run < max_attempts_this_run and not success:
            attempts_this_run += 1
            attempt += 1
            log_entry.attempt_count = attempt
            try:
                await send_email_async(recipient_email, subject, content)
                success = True
                log_entry.status = NotificationStatus.sent
                log_entry.sent_at = datetime.now(timezone.utc)
            except Exception as e:
                logger.warning(f"Email delivery failed attempt {attempt}: {e}")
                last_err = str(e)
                if attempts_this_run < max_attempts_this_run:
                    log_entry.status = NotificationStatus.retrying
                    log_entry.last_error = last_err
                    db.commit()
                    await asyncio.sleep(BACKOFF_BASE ** attempts_this_run)
                else:
                    log_entry.status = NotificationStatus.failed
                    log_entry.last_error = last_err
        
        db.commit()
    finally:
        db.close()

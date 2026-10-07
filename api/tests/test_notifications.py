import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch, AsyncMock

from app.main import app
from app.db.session import SessionLocal
from app.models.notification import Notification, NotificationLog, NotificationStatus, NotificationType
from app.models.users import User, RoleEnum

client = TestClient(app)

def test_notification_delivery_and_resend():
    db = SessionLocal()
    from app.core.security import create_access_token
    # Create a user to notify
    user = User(email=f"notif_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.student)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(user.id, user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test manual creation of notification to simulate trigger
    notif = Notification(
        recipient_user_id=user.id,
        type=NotificationType.new_opportunity,
        payload={"job_id": "123", "job_title": "Software Engineer"}
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # Check that student can see the notification
    r = client.get("/api/v1/notifications/me", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1
    assert r.json()[0]["type"] == "new_opportunity"
    assert r.json()[0]["payload"]["job_id"] == "123"

@pytest.mark.anyio
async def test_email_dispatch_retry():
    db = SessionLocal()
    from app.services.email import _dispatch_async
    
    user = User(email=f"notif2_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.student)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    notif = Notification(
        recipient_user_id=user.id,
        type=NotificationType.new_opportunity,
        payload={"job_title": "Test Job"}
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # Mock aiosmtplib.send to fail 2 times then succeed
    call_count = 0
    async def mock_send(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise Exception("SMTP error")
        return True
        
    with patch("app.services.email.aiosmtplib.send", new=AsyncMock(side_effect=mock_send)):
        # Temporarily reduce backoff for fast test
        with patch("app.services.email.BACKOFF_BASE", 0):
            await _dispatch_async(
                notification_id=str(notif.id),
                recipient_email=user.email,
                subject="Test",
                content="Test body"
            )
            
    # Check logs
    logs = db.query(NotificationLog).filter(NotificationLog.notification_id == notif.id).all()
    assert len(logs) == 1
    log = logs[0]
    assert log.status == NotificationStatus.sent
    assert log.attempt_count == 3
    assert log.last_error == "SMTP error"

@pytest.mark.anyio
async def test_email_dispatch_failure():
    db = SessionLocal()
    from app.services.email import _dispatch_async
    
    user = User(email=f"notif3_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.student)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    notif = Notification(
        recipient_user_id=user.id,
        type=NotificationType.new_opportunity,
        payload={"job_title": "Test Job"}
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    async def mock_send_fail(*args, **kwargs):
        raise Exception("Permanent SMTP error")
        
    with patch("app.services.email.aiosmtplib.send", new=AsyncMock(side_effect=mock_send_fail)):
        with patch("app.services.email.BACKOFF_BASE", 0):
            await _dispatch_async(
                notification_id=str(notif.id),
                recipient_email=user.email,
                subject="Test",
                content="Test body"
            )
            
    # Check logs
    log = db.query(NotificationLog).filter(NotificationLog.notification_id == notif.id).first()
    assert log.status == NotificationStatus.failed
    assert log.attempt_count == 3
    assert log.last_error == "Permanent SMTP error"

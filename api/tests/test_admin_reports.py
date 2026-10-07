import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4

from app.main import app
from app.db.session import SessionLocal
from app.models.users import User, RoleEnum, Company, ApprovalStatusEnum, Student, PlacementStatusEnum, Admin
from app.models.job import JobRequirement, JobStatusEnum
from app.models.feedback import Feedback, AuthorTypeEnum, TargetTypeEnum
from app.models.audit import AuditLog
from app.models.application import Application, ApplicationStatusEnum

client = TestClient(app)

def test_admin_queues_summary():
    db = SessionLocal()
    from app.core.security import create_access_token
    
    admin_user = User(email=f"admin_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.admin)
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    token = create_access_token(admin_user.id, admin_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add a pending company
    c_user = User(email=f"c_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.company)
    db.add(c_user)
    db.commit()
    comp = Company(user_id=c_user.id, company_name="Test Corp", approval_status=ApprovalStatusEnum.pending)
    db.add(comp)
    db.commit()
    
    # Add a pending job
    job = JobRequirement(
        company_id=comp.id, 
        title="Software Engineer", 
        description="Test", 
        vacancies=5, 
        application_deadline="2030-01-01T00:00:00Z",
        status=JobStatusEnum.pending_review
    )
    db.add(job)
    db.commit()
    
    # Add a flagged feedback
    s_user = User(email=f"s_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.student)
    db.add(s_user)
    db.commit()
    
    fb = Feedback(
        author_type=AuthorTypeEnum.student,
        author_id=s_user.id,
        target_type=TargetTypeEnum.company,
        target_id=comp.id,
        content="Bad experience",
        flagged=True
    )
    db.add(fb)
    db.commit()
    
    r = client.get("/api/v1/admin/queues/summary", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert "pending_companies" in data
    assert "pending_jobs" in data
    assert "flagged_feedback" in data
    
    # We can't assert exact values because of other tests running in the same DB,
    # but we can ensure they are >= 1 since we just added one of each.
    assert data["pending_companies"] >= 1
    assert data["pending_jobs"] >= 1
    assert data["flagged_feedback"] >= 1

def test_admin_reports_placement_stats():
    db = SessionLocal()
    from app.core.security import create_access_token
    
    admin_user = User(email=f"admin2_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.admin)
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    token = create_access_token(admin_user.id, admin_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create student with placed status
    s_user = User(email=f"s2_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.student)
    db.add(s_user)
    db.commit()
    student = Student(
        user_id=s_user.id,
        roll_number=f"R_{uuid4().hex[:8]}",
        full_name="John Doe",
        placement_status=PlacementStatusEnum.placed
    )
    db.add(student)
    db.commit()
    
    r = client.get("/api/v1/admin/reports/placement-stats", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total_students"] >= 1
    assert data["total_placed_students"] >= 1
    assert "students_by_status" in data
    assert data["students_by_status"]["placed"] >= 1

def test_admin_audit_log():
    db = SessionLocal()
    from app.core.security import create_access_token
    
    admin_user = User(email=f"admin3_{uuid4()}@test.local", password_hash="hash", role=RoleEnum.admin)
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    token = create_access_token(admin_user.id, admin_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create an audit log entry
    log = AuditLog(
        actor_user_id=admin_user.id,
        action="test_action",
        entity_type="test",
        entity_id=uuid4()
    )
    db.add(log)
    db.commit()
    
    r = client.get("/api/v1/admin/audit-log", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Verify pagination
    r_paginated = client.get("/api/v1/admin/audit-log?limit=1", headers=headers)
    assert r_paginated.status_code == 200
    assert len(r_paginated.json()) == 1

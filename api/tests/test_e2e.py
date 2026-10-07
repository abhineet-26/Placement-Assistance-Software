import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from uuid import uuid4

from app.main import app
from app.db.session import SessionLocal
from app.models.users import User, RoleEnum, Company, Student, Admin
from app.models.job import JobRequirement, JobStatusEnum
from app.models.application import Application, ApplicationStatusEnum
from app.models.match import Match
from app.models.cv import CV

client = TestClient(app)

def test_e2e_pipeline():
    # 1. Setup admin token
    db = SessionLocal()
    from app.core.security import create_access_token
    
    admin_email = f"e2e_admin_{uuid4().hex[:8]}@example.com"
    admin_user = User(email=admin_email, password_hash="hash", role=RoleEnum.admin)
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    admin_profile = Admin(user_id=admin_user.id, full_name="Test Admin")
    db.add(admin_profile)
    db.commit()
    
    admin_token = create_access_token(admin_user.id, admin_user.role.value)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Register Company
    comp_email = f"e2e_comp_{uuid4().hex[:8]}@example.com"
    r = client.post("/api/v1/auth/register/company", json={
        "email": comp_email,
        "password": "password123",
        "company_name": "E2E Corp",
        "contact_person": "Jane Doe",
        "contact_phone": "1234567890",
        "about": "E2E testing company"
    })
    if r.status_code != 201:
        print(r.json())
    assert r.status_code == 201
    
    # 3. Register Student
    stud_email = f"e2e_stud_{uuid4().hex[:8]}@example.com"
    r = client.post("/api/v1/auth/register/student", json={
        "email": stud_email,
        "password": "password123",
        "roll_number": f"E2E_{uuid4().hex[:6]}",
        "full_name": "E2E Student",
        "phone": "0987654321",
        "programme": "B.Tech",
        "branch": "CSE",
        "batch_year": 2024,
        "cgpa": 9.5
    })
    assert r.status_code == 201
    
    # Login Company
    r = client.post("/api/v1/auth/login", json={"email": comp_email, "password": "password123"})
    if r.status_code != 200:
        print(r.json())
    assert r.status_code == 200
    comp_token = r.json()["access_token"]
    comp_headers = {"Authorization": f"Bearer {comp_token}"}
    
    # Company cannot post job yet (pending approval)
    r = client.post("/api/v1/jobs", json={
        "title": "Software Engineer",
        "description": "E2E Test Job",
        "required_skills": ["Python", "FastAPI"],
        "vacancies": 2,
        "application_deadline": "2030-01-01T00:00:00Z"
    }, headers=comp_headers)
    assert r.status_code == 403
    
    # 4. Admin approves company
    db.refresh(admin_user)
    c_user = db.query(User).filter(User.email == comp_email).first()
    comp = db.query(Company).filter(Company.user_id == c_user.id).first()
    r = client.patch(f"/api/v1/companies/{comp.id}/approve", headers=admin_headers)
    assert r.status_code == 200
    
    # 5. Company posts a job
    r = client.post("/api/v1/jobs", json={
        "title": "Software Engineer",
        "description": "E2E Test Job",
        "required_skills": ["Python", "FastAPI"],
        "vacancies": 2,
        "application_deadline": "2030-01-01T00:00:00Z"
    }, headers=comp_headers)
    assert r.status_code == 201
    job_id = r.json()["id"]
    
    # 6. Admin approves job
    r = client.patch(f"/api/v1/jobs/{job_id}/approve", headers=admin_headers)
    assert r.status_code == 200
    
    # Login Student
    r = client.post("/api/v1/auth/login", json={"email": stud_email, "password": "password123"})
    assert r.status_code == 200
    stud_token = r.json()["access_token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}
    
    # 7. Student applies to job (needs CV first)
    r = client.put("/api/v1/cv/me", json={
        "contact_details": {"email": stud_email},
        "education": [{"degree": "B.Tech", "institution": "XYZ"}],
        "skills": ["Python", "FastAPI"]
    }, headers=stud_headers)
    assert r.status_code == 200
    
    r = client.post("/api/v1/applications", json={"job_id": job_id}, headers=stud_headers)
    assert r.status_code == 201
    
    # 8. Matching (admin triggers it or auto triggered, let's trigger it manually to be sure)
    r = client.post(f"/api/v1/jobs/{job_id}/run-matching", headers=admin_headers)
    assert r.status_code == 200
    
    # 9. Admin forwards CV
    r = client.get(f"/api/v1/jobs/{job_id}/matches", headers=admin_headers)
    assert r.status_code == 200
    match_id = r.json()[0]["id"]
    app_id = r.json()[0]["application_id"]
    
    r = client.post(f"/api/v1/jobs/{job_id}/approve-forwarding", json={"match_ids": [match_id]}, headers=admin_headers)
    assert r.status_code == 200
    
    # 10. Admin creates interview
    
    r = client.post("/api/v1/interviews", json={
        "application_id": app_id,
        "round_number": 1,
        "round_name": "Technical",
        "scheduled_at": "2030-01-02T10:00:00Z",
        "location_or_mode": "Online"
    }, headers=admin_headers)
    if r.status_code != 201:
        print(r.json())
    assert r.status_code == 201
    
    # 11. Admin creates offer
    r = client.post("/api/v1/offers", json={
        "application_id": app_id,
        "offer_details": {
            "offer_type": "full_time",
            "ctc": 1500000.0,
            "deadline": "2030-01-10T10:00:00Z"
        }
    }, headers=admin_headers)
    assert r.status_code == 201
    
    # Verify student is placed
    db_app = db.query(Application).filter(Application.id == app_id).first()
    assert db_app.status == ApplicationStatusEnum.offer_received
    
    db_stud = db.query(Student).filter(Student.user_id == db_app.student.user_id).first()
    assert db_stud.placement_status.value in ["offer_received", "placed"]
    
    # 12. Feedback
    r = client.post("/api/v1/feedback", json={
        "target_type": "company",
        "target_id": str(comp.id),
        "content": "Great interview process!",
        "rating": 5
    }, headers=stud_headers)
    assert r.status_code == 201

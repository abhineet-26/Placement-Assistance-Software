import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
from datetime import datetime, timedelta

client = TestClient(app)

def test_cv_forwarding_lifecycle():
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@placement.local", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    
    # 1. Create two companies
    c1_id = uuid.uuid4().hex[:6]
    comp1_res = client.post(
        "/api/v1/auth/register/company",
        json={"email": f"c1_{c1_id}@test.com", "password": "pass", "company_name": f"Company {c1_id}"}
    )
    t_c1 = comp1_res.json()["access_token"]
    
    c2_id = uuid.uuid4().hex[:6]
    comp2_res = client.post(
        "/api/v1/auth/register/company",
        json={"email": f"c2_{c2_id}@test.com", "password": "pass", "company_name": f"Company {c2_id}"}
    )
    t_c2 = comp2_res.json()["access_token"]
    
    # Approve both companies
    c1_me = client.get("/api/v1/companies/me", headers={"Authorization": f"Bearer {t_c1}"}).json()
    client.patch(f"/api/v1/companies/{c1_me['id']}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    c2_me = client.get("/api/v1/companies/me", headers={"Authorization": f"Bearer {t_c2}"}).json()
    client.patch(f"/api/v1/companies/{c2_me['id']}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    # 2. Create job for comp1
    job_res = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {t_c1}"},
        json={
            "title": "Test Job",
            "description": "desc",
            "required_skills": ["Python"],
            "vacancies": 1,
            "application_deadline": (datetime.utcnow() + timedelta(days=10)).isoformat() + "Z",
            "min_cgpa": 5.0,
            "allowed_branches": ["CSE"]
        }
    )
    job_id = job_res.json()["id"]
    client.patch(f"/api/v1/jobs/{job_id}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    # 3. Create student, CV, and apply
    stu_id = uuid.uuid4().hex[:6]
    stu_res = client.post(
        "/api/v1/auth/register/student",
        json={"email": f"stu_{stu_id}@test.com", "password": "pass", "roll_number": f"STU_{stu_id}", "full_name": "Student"}
    )
    student_token = stu_res.json()["access_token"]
    
    client.patch(
        "/api/v1/students/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"cgpa": 9.0, "branch": "CSE", "backlogs": 0}
    )
    client.put(
        "/api/v1/cv/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"skills": ["Python"], "academic_record": {"education": "BTech"}}
    )
    
    client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"job_id": job_id}
    )
    
    # Run matching
    client.post(f"/api/v1/jobs/{job_id}/run-matching", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Get match ID
    matches_res = client.get(f"/api/v1/jobs/{job_id}/matches", headers={"Authorization": f"Bearer {admin_token}"})
    matches = matches_res.json()
    assert len(matches) > 0
    match_id = matches[0]["id"]
    
    # --- TEST 1: Company 1 fetches their CVs before approval -> should be empty
    res = client.get("/api/v1/companies/me/received-cvs", headers={"Authorization": f"Bearer {t_c1}"})
    assert res.status_code == 200
    assert len(res.json()) == 0
    
    # --- TEST 2: Admin approves forwarding
    res = client.post(
        f"/api/v1/jobs/{job_id}/approve-forwarding",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"match_ids": [match_id]}
    )
    assert res.status_code == 200
    
    # --- TEST 3: Company 1 fetches their CVs after approval -> should see CV
    res = client.get("/api/v1/companies/me/received-cvs", headers={"Authorization": f"Bearer {t_c1}"})
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["student_cv"]["skills"] == ["Python"]
    
    # --- TEST 4: Cross-company access -> Company 2 tries to fetch -> should be empty
    res = client.get("/api/v1/companies/me/received-cvs", headers={"Authorization": f"Bearer {t_c2}"})
    assert res.status_code == 200
    assert len(res.json()) == 0
    
    # Optional test for manual override
    res = client.patch(
        f"/api/v1/jobs/{match_id}/override",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"forwarding_status": "pending"}
    )
    assert res.status_code == 200
    assert res.json()["forwarding_status"] == "pending"

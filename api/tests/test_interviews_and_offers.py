import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
from datetime import datetime, timedelta

client = TestClient(app)

def test_interviews_and_offers_lifecycle():
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@placement.local", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    
    # 1. Create a student
    s_id = uuid.uuid4().hex[:6]
    stud_res = client.post(
        "/api/v1/auth/register/student",
        json={
            "email": f"s_{s_id}@test.com", "password": "pass", 
            "roll_number": f"RL{s_id}", "department": "CS", "cgpa": 8.5,
            "full_name": "Student Name"
        }
    )
    t_stud = stud_res.json()["access_token"]
    
    # 2. Create a company
    c_id = uuid.uuid4().hex[:6]
    comp_res = client.post(
        "/api/v1/auth/register/company",
        json={"email": f"c_{c_id}@test.com", "password": "pass", "company_name": f"Company {c_id}"}
    )
    t_comp = comp_res.json()["access_token"]
    comp_me_res = client.get(
        "/api/v1/companies/me",
        headers={"Authorization": f"Bearer {t_comp}"}
    )
    target_company_id = comp_me_res.json()["id"]

    # Admin approves company
    client.patch(
        f"/api/v1/companies/{target_company_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # 3. Company creates a job
    job_res = client.post(
        "/api/v1/jobs/",
        json={
            "title": "Software Engineer",
            "description": "Dev job",
            "required_skills": ["Python"],
            "vacancies": 5,
            "min_cgpa": 7.0,
            "application_deadline": (datetime.utcnow() + timedelta(days=10)).isoformat() + "Z"
        },
        headers={"Authorization": f"Bearer {t_comp}"}
    )
    assert job_res.status_code == 201
    job_id = job_res.json()["id"]

    # Admin approves job
    client.patch(f"/api/v1/jobs/{job_id}/approve", headers={"Authorization": f"Bearer {admin_token}"})

    # Update student profile to meet requirements
    client.patch(
        "/api/v1/students/me",
        headers={"Authorization": f"Bearer {t_stud}"},
        json={"cgpa": 9.5, "branch": "CSE", "backlogs": 0}
    )
    
    # Add CV for student
    client.put(
        "/api/v1/cv/me",
        headers={"Authorization": f"Bearer {t_stud}"},
        json={"skills": ["Python"], "academic_record": {"education": "BTech"}}
    )
    
    # 4. Student applies to job
    app_res = client.post(
        "/api/v1/applications/",
        json={"job_id": job_id},
        headers={"Authorization": f"Bearer {t_stud}"}
    )
    app_id = app_res.json()["id"]
    
    # Initial status
    assert app_res.json()["status"] == "applied"
    
    # 5. Non-admin cannot create interview
    res = client.post(
        "/api/v1/interviews/",
        json={
            "application_id": app_id,
            "scheduled_at": (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z",
            "location_or_mode": "technical"
        },
        headers={"Authorization": f"Bearer {t_comp}"}
    )
    assert res.status_code == 403
    
    res = client.post(
        "/api/v1/interviews/",
        json={
            "application_id": app_id,
            "scheduled_at": (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z",
            "location_or_mode": "technical"
        },
        headers={"Authorization": f"Bearer {t_stud}"}
    )
    assert res.status_code == 403
    
    # 6. Admin creates an interview
    interview_res = client.post(
        "/api/v1/interviews/",
        json={
            "application_id": app_id,
            "scheduled_at": (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z",
            "location_or_mode": "technical"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert interview_res.status_code == 201
    interview_id = interview_res.json()["id"]
    
    # Check application status updated to "interview_scheduled" via student /me endpoint
    apps_check = client.get("/api/v1/applications/me", headers={"Authorization": f"Bearer {t_stud}"})
    assert apps_check.status_code == 200
    app_status = next(a["status"] for a in apps_check.json() if a["id"] == app_id)
    assert app_status == "interview_scheduled"
    
    # 7. Non-admin cannot create offer
    res = client.post(
        "/api/v1/offers/",
        json={
            "application_id": app_id,
            "offer_details": {"ctc": "20 LPA", "role": "SWE"}
        },
        headers={"Authorization": f"Bearer {t_comp}"}
    )
    assert res.status_code == 403
    
    # 8. Admin creates an offer
    offer_res = client.post(
        "/api/v1/offers/",
        json={
            "application_id": app_id,
            "offer_details": {"ctc": "20 LPA", "role": "SWE"}
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert offer_res.status_code == 201
    offer_id = offer_res.json()["id"]
    
    # Check application status updated to "offer_received"
    apps_check = client.get("/api/v1/applications/me", headers={"Authorization": f"Bearer {t_stud}"})
    assert apps_check.status_code == 200
    app_status = next(a["status"] for a in apps_check.json() if a["id"] == app_id)
    assert app_status == "offer_received"

    decision_res = client.patch(
        f"/api/v1/offers/{offer_id}/decision",
        json={"status": "declined"},
        headers={"Authorization": f"Bearer {t_stud}"}
    )
    assert decision_res.status_code == 200

    apps_check = client.get("/api/v1/applications/me", headers={"Authorization": f"Bearer {t_stud}"})
    assert apps_check.status_code == 200
    app_status = next(a["status"] for a in apps_check.json() if a["id"] == app_id)
    assert app_status == "interview_scheduled"
    
    # 9. Admin updates offer status to accepted
    offer_update_res = client.patch(
        f"/api/v1/offers/{offer_id}",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert offer_update_res.status_code == 200
    
    # Check application status updated to "placed"
    apps_check = client.get("/api/v1/applications/me", headers={"Authorization": f"Bearer {t_stud}"})
    assert apps_check.status_code == 200
    app_status = next(a["status"] for a in apps_check.json() if a["id"] == app_id)
    assert app_status == "placed"
    
    # Check student placement status updated to "placed"
    stud_check = client.get("/api/v1/students/me", headers={"Authorization": f"Bearer {t_stud}"})
    assert stud_check.status_code == 200
    assert stud_check.json()["placement_status"] == "placed"

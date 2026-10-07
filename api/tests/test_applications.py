import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
from datetime import datetime, timedelta

client = TestClient(app)

def setup_test_job(admin_token):
    # Register and approve company
    comp_id = uuid.uuid4().hex[:6]
    comp_res = client.post(
        "/api/v1/auth/register/company",
        json={"email": f"company_{comp_id}@test.com", "password": "pass", "company_name": "Test Co"}
    )
    company_token = comp_res.json()["access_token"]
    
    comp_me = client.get("/api/v1/companies/me", headers={"Authorization": f"Bearer {company_token}"}).json()
    client.patch(f"/api/v1/companies/{comp_me['id']}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Post and approve job 1 (Standard)
    job_res = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {company_token}"},
        json={
            "title": "Software Engineer",
            "description": "Dev",
            "required_skills": ["Python"],
            "vacancies": 5,
            "application_deadline": (datetime.utcnow() + timedelta(days=10)).isoformat() + "Z",
            "min_cgpa": 7.0,
            "allowed_branches": ["CSE", "IT"],
            "max_backlogs": 1
        }
    )
    job_id = job_res.json()["id"]
    client.patch(f"/api/v1/jobs/{job_id}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Post and approve job 2 (Strict CGPA)
    job_res2 = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {company_token}"},
        json={
            "title": "Senior Engineer",
            "description": "Dev",
            "required_skills": ["Python"],
            "vacancies": 2,
            "application_deadline": (datetime.utcnow() + timedelta(days=10)).isoformat() + "Z",
            "min_cgpa": 9.5
        }
    )
    job_id2 = job_res2.json()["id"]
    client.patch(f"/api/v1/jobs/{job_id2}/approve", headers={"Authorization": f"Bearer {admin_token}"})

    # Post and approve job 3 (Past deadline)
    job_res3 = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {company_token}"},
        json={
            "title": "Expired Job",
            "description": "Dev",
            "required_skills": ["Python"],
            "vacancies": 1,
            "application_deadline": (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z",
        }
    )
    job_id3 = job_res3.json()["id"]
    client.patch(f"/api/v1/jobs/{job_id3}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    return job_id, job_id2, job_id3

def test_applications_lifecycle():
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@placement.local", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    
    job_id_standard, job_id_strict, job_id_expired = setup_test_job(admin_token)
    
    # 1. Setup Student
    roll_no = f"STU_{uuid.uuid4().hex[:6]}"
    stu_res = client.post(
        "/api/v1/auth/register/student",
        json={"email": f"student_{roll_no}@test.com", "password": "pass", "roll_number": roll_no, "full_name": "Applicant"}
    )
    student_token = stu_res.json()["access_token"]
    
    # Update profile to have CGPA 8.0, Branch CSE, 0 backlogs
    client.patch(
        "/api/v1/students/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"cgpa": 8.0, "branch": "CSE", "backlogs": 0}
    )
    
    # 2. Test applying without CV (Should fail)
    no_cv_res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"job_id": job_id_standard}
    )
    assert no_cv_res.status_code == 400
    assert "upload a CV" in no_cv_res.json()["detail"]
    
    # Upload CV
    client.put(
        "/api/v1/cv/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"content": {"education": "BTech", "skills": ["Python"]}}
    )
    
    # 3. Test eligible application (Should succeed)
    apply_res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"job_id": job_id_standard}
    )
    assert apply_res.status_code == 201
    app_id = apply_res.json()["id"]
    assert apply_res.json()["status"] == "applied"
    
    # 4. Test duplicate application (Should fail)
    dup_res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"job_id": job_id_standard}
    )
    assert dup_res.status_code == 400
    assert "already applied" in dup_res.json()["detail"]
    
    # 5. Test ineligible application (Should fail due to CGPA)
    inelig_res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"job_id": job_id_strict}
    )
    assert inelig_res.status_code == 400
    assert "CGPA too low" in inelig_res.json()["detail"]
    
    # 6. Test past deadline (Should fail)
    expired_res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"job_id": job_id_expired}
    )
    assert expired_res.status_code == 400
    assert "deadline has passed" in expired_res.json()["detail"]
    
    # 7. Test get my applications
    my_apps = client.get("/api/v1/applications/me", headers={"Authorization": f"Bearer {student_token}"})
    assert my_apps.status_code == 200
    apps_list = my_apps.json()
    assert len(apps_list) == 1
    assert apps_list[0]["job_id"] == job_id_standard
    assert "job_summary" in apps_list[0]
    
    # 8. Test withdraw
    withdraw_res = client.patch(
        f"/api/v1/applications/{app_id}/withdraw",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert withdraw_res.status_code == 200
    assert withdraw_res.json()["status"] == "withdrawn"

import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_company_job_lifecycle():
    # 1. Register a company
    comp_id = uuid.uuid4().hex[:6]
    company_email = f"company_{comp_id}@test.com"
    comp_res = client.post(
        "/api/v1/auth/register/company",
        json={
            "email": company_email,
            "password": "password123",
            "company_name": "Test Company"
        }
    )
    assert comp_res.status_code == 201
    company_token = comp_res.json()["access_token"]
    
    # 2. Try to post a job before approval (should fail)
    job_payload = {
        "title": "Software Engineer",
        "description": "Develop stuff",
        "required_skills": ["Python", "FastAPI"],
        "vacancies": 5,
        "application_deadline": "2027-12-31T23:59:59Z",
        "min_cgpa": 7.5
    }
    job_fail_res = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {company_token}"},
        json=job_payload
    )
    assert job_fail_res.status_code == 403
    assert "Company not approved yet" in job_fail_res.json()["detail"]
    
    # 3. Admin logs in
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@placement.local", "password": "admin123"}
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    
    # 4. Admin approves company
    # First get company ID from /me
    comp_me_res = client.get(
        "/api/v1/companies/me",
        headers={"Authorization": f"Bearer {company_token}"}
    )
    assert comp_me_res.status_code == 200
    target_company_id = comp_me_res.json()["id"]
    
    approve_comp_res = client.patch(
        f"/api/v1/companies/{target_company_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert approve_comp_res.status_code == 200
    assert approve_comp_res.json()["approval_status"] == "approved"
    
    # 5. Company posts a job
    job_res = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {company_token}"},
        json=job_payload
    )
    assert job_res.status_code == 201
    job_id = job_res.json()["id"]
    assert job_res.json()["status"] == "pending_review"
    
    # 6. Admin returns the job
    return_res = client.patch(
        f"/api/v1/jobs/{job_id}/return",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"review_comment": "Please add more details to description."}
    )
    assert return_res.status_code == 200
    assert return_res.json()["status"] == "returned"
    assert return_res.json()["review_comment"] == "Please add more details to description."
    
    # 7. Admin approves the job
    approve_job_res = client.patch(
        f"/api/v1/jobs/{job_id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert approve_job_res.status_code == 200
    assert approve_job_res.json()["status"] == "published"
    
    # 8. Student can see the published job
    roll_no = f"STU_{uuid.uuid4().hex[:6]}"
    student_email = f"student_{roll_no}@test.com"
    stu_res = client.post(
        "/api/v1/auth/register/student",
        json={
            "email": student_email,
            "password": "password123",
            "roll_number": roll_no,
            "full_name": "Test Student"
        }
    )
    student_token = stu_res.json()["access_token"]
    
    jobs_list = client.get(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert jobs_list.status_code == 200
    assert any(j["id"] == job_id for j in jobs_list.json())

    # 9. Test Company can't approve job
    bad_approve_res = client.patch(
        f"/api/v1/jobs/{job_id}/approve",
        headers={"Authorization": f"Bearer {company_token}"}
    )
    assert bad_approve_res.status_code == 403

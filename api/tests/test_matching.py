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
        json={"email": f"company_{comp_id}@test.com", "password": "pass", "company_name": f"Test Co {comp_id}"}
    )
    company_token = comp_res.json()["access_token"]
    
    comp_me = client.get("/api/v1/companies/me", headers={"Authorization": f"Bearer {company_token}"}).json()
    client.patch(f"/api/v1/companies/{comp_me['id']}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Post and approve job
    job_res = client.post(
        "/api/v1/jobs/",
        headers={"Authorization": f"Bearer {company_token}"},
        json={
            "title": "Data Scientist",
            "description": "ML stuff",
            "required_skills": ["Python", "SQL", "Machine Learning"],
            "vacancies": 2,
            "application_deadline": (datetime.utcnow() + timedelta(days=10)).isoformat() + "Z",
            "min_cgpa": 7.0,
            "allowed_branches": ["CSE", "ECE"]
        }
    )
    job_id = job_res.json()["id"]
    client.patch(f"/api/v1/jobs/{job_id}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    
    return job_id

def create_student_and_apply(job_id, cgpa, branch, skills):
    roll_no = f"STU_{uuid.uuid4().hex[:6]}"
    stu_res = client.post(
        "/api/v1/auth/register/student",
        json={"email": f"student_{roll_no}@test.com", "password": "pass", "roll_number": roll_no, "full_name": f"Applicant {roll_no}"}
    )
    student_token = stu_res.json()["access_token"]
    
    # 1. Temporarily set to a perfectly eligible profile to bypass Phase 4 checks
    client.patch(
        "/api/v1/students/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"cgpa": 9.5, "branch": "CSE", "backlogs": 0}
    )
    
    client.put(
        "/api/v1/cv/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"skills": ["Python"], "academic_record": {"education": "BTech"}}
    )
    
    # 2. Apply to the job
    apply_res = client.post(
        "/api/v1/applications/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"job_id": job_id}
    )
    
    # 3. Now change profile and CV to the *actual* target values for matching test
    client.patch(
        "/api/v1/students/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"cgpa": cgpa, "branch": branch, "backlogs": 0}
    )
    client.put(
        "/api/v1/cv/me",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"skills": skills, "academic_record": {"education": "BTech"}}
    )
    return student_token

def test_matching_engine():
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@placement.local", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    
    job_id = setup_test_job(admin_token)
    
    # 1. High overlap, eligible
    create_student_and_apply(job_id, cgpa=8.5, branch="CSE", skills=["Python", "SQL", "Machine Learning"])
    
    # 2. Medium overlap, eligible
    create_student_and_apply(job_id, cgpa=9.0, branch="CSE", skills=["Python", "Java"])
    
    # 3. Low overlap, eligible
    create_student_and_apply(job_id, cgpa=7.5, branch="ECE", skills=["C++"])
    
    # 4. High overlap, ineligible (changed CGPA to 6.0 after applying)
    s4_token = create_student_and_apply(job_id, cgpa=6.0, branch="CSE", skills=["Python", "SQL", "Machine Learning"])
    
    # 5. Medium overlap, ineligible (changed branch to MECH after applying)
    s5_token = create_student_and_apply(job_id, cgpa=8.0, branch="MECH", skills=["Python", "SQL"])
    
    # Trigger matching
    match_res = client.post(f"/api/v1/jobs/{job_id}/run-matching", headers={"Authorization": f"Bearer {admin_token}"})
    assert match_res.status_code == 200
    
    # Fetch matches
    get_matches = client.get(f"/api/v1/jobs/{job_id}/matches", headers={"Authorization": f"Bearer {admin_token}"})
    assert get_matches.status_code == 200
    matches = get_matches.json()
    
    assert len(matches) == 5
    
    # The first one should be the high overlap eligible candidate (skill score = 1.0)
    assert matches[0]["hard_filter_passed"] is True
    assert matches[0]["included_in_shortlist"] is True
    assert matches[0]["skill_score"] == 1.0
    
    # The second one should be medium overlap eligible (skill score = 0.333...)
    assert matches[1]["hard_filter_passed"] is True
    assert matches[1]["included_in_shortlist"] is True
    assert matches[1]["skill_score"] > 0.3 and matches[1]["skill_score"] < 0.4
    
    # The third one should be low overlap eligible (skill score = 0.0)
    assert matches[2]["hard_filter_passed"] is True
    assert matches[2]["included_in_shortlist"] is True
    assert matches[2]["skill_score"] == 0.0
    
    # The last two should be ineligible (hard_filter_passed = False)
    assert matches[3]["hard_filter_passed"] is False
    assert matches[3]["included_in_shortlist"] is False
    assert matches[4]["hard_filter_passed"] is False
    assert matches[4]["included_in_shortlist"] is False

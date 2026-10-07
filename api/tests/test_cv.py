import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_student_profile_and_cv():
    # 1. Register a student
    roll_no = f"STU_{uuid.uuid4().hex[:6]}"
    email = f"student_{roll_no}@test.com"
    response = client.post(
        "/api/v1/auth/register/student",
        json={
            "email": email,
            "password": "password123",
            "roll_number": roll_no,
            "full_name": "Test Student"
        }
    )
    assert response.status_code == 201
    access_token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 2. Get Profile
    profile_res = client.get("/api/v1/students/me", headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["full_name"] == "Test Student"
    
    # 3. Update Profile
    update_res = client.patch(
        "/api/v1/students/me",
        headers=headers,
        json={"cgpa": 9.5, "branch": "CS"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["cgpa"] == 9.5
    assert update_res.json()["branch"] == "CS"
    
    # 4. Get CV (should be empty initially)
    cv_res = client.get("/api/v1/cv/me", headers=headers)
    assert cv_res.status_code == 404
    
    # 5. Create CV
    cv_data1 = {"summary": "Experienced dev", "skills": ["Python"]}
    create_cv_res = client.put(
        "/api/v1/cv/me",
        headers=headers,
        json=cv_data1
    )
    assert create_cv_res.status_code == 200
    assert create_cv_res.json()["summary"] == "Experienced dev"
    assert create_cv_res.json()["skills"] == ["Python"]
    assert create_cv_res.json()["version"] == 1
    
    # 6. Update CV (overwrite)
    cv_data2 = {"summary": "More experienced dev", "skills": ["Python", "React"]}
    update_cv_res = client.put(
        "/api/v1/cv/me",
        headers=headers,
        json=cv_data2
    )
    assert update_cv_res.status_code == 200
    assert update_cv_res.json()["summary"] == "More experienced dev"
    assert update_cv_res.json()["skills"] == ["Python", "React"]
    assert update_cv_res.json()["version"] == 2
    
    # 7. Check CV versions
    versions_res = client.get("/api/v1/cv/me/versions", headers=headers)
    assert versions_res.status_code == 200
    versions = versions_res.json()
    assert len(versions) == 2
    assert versions[0]["version"] == 2
    assert versions[0]["snapshot"]["summary"] == "More experienced dev"
    assert versions[1]["version"] == 1
    assert versions[1]["snapshot"]["summary"] == "Experienced dev"

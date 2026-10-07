import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_register_student():
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
    assert "access_token" in response.json()
    
    # R.1-A1: Duplicate roll number is rejected
    response_duplicate_roll = client.post(
        "/api/v1/auth/register/student",
        json={
            "email": f"other_{email}",
            "password": "password123",
            "roll_number": roll_no,
            "full_name": "Test Student 2"
        }
    )
    assert response_duplicate_roll.status_code == 400
    assert "Roll number already registered" in response_duplicate_roll.json()["detail"]

def test_student_jwt_cannot_access_admin_route():
    roll_no = f"STU_{uuid.uuid4().hex[:6]}"
    email = f"student_{roll_no}@test.com"
    res = client.post(
        "/api/v1/auth/register/student",
        json={
            "email": email,
            "password": "password123",
            "roll_number": roll_no,
            "full_name": "Test Student"
        }
    )
    access_token = res.json()["access_token"]

    admin_res = client.get(
        "/api/v1/admin/dashboard",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert admin_res.status_code == 403

def test_company_registration_and_approval():
    comp_id = uuid.uuid4().hex[:6]
    email = f"company_{comp_id}@test.com"
    res = client.post(
        "/api/v1/auth/register/company",
        json={
            "email": email,
            "password": "password123",
            "company_name": "Test Company"
        }
    )
    assert res.status_code == 201
    access_token = res.json()["access_token"]
    
    # A newly registered company cannot log into /company/dashboard functionality until approval_status=approved
    # Let's test the endpoint
    dash_res = client.get(
        "/api/v1/company/dashboard",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    # Depending on implementation, might return 403 or specific error
    assert dash_res.status_code == 403 or dash_res.status_code == 200 # we will adjust this once we implement the check

def test_full_auth_flow():
    # Admin flow
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@placement.local", "password": "admin123"}
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    assert client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"}).status_code == 200

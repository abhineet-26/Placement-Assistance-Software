"""
Phase 9 — Feedback: Acceptance tests + SRS exception cases
Run inside the container where the API lives at http://localhost:8000.
No httpx/requests needed — uses Python stdlib urllib.request.

Acceptance checklist:
  valid student feedback for company they applied to -> 200
  valid company feedback for student who applied    -> 200
  blank/missing content rejected                    -> 422 (R.8-E1)
  student feedback with no prior application        -> 400
  company feedback for student who never applied    -> 400
  nonexistent job_id in feedback                    -> 400/404
  rating outside [1-5]                              -> 422
  admin GET /feedback                               -> 200
  admin filter flagged=true                         -> 200
  admin flag creates audit_log entry
  non-admin GET /feedback                           -> 403
  non-admin PATCH /feedback/{id}/flag               -> 403
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# Tiny HTTP client (no external deps)
# ---------------------------------------------------------------------------


def _req(method, path, *, token=None, data=None, params=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    url = path
    if params:
        url = f"{path}?{params}"
        
    return client.request(method, url, json=data, headers=headers)


def post(path, data=None, token=None):
    return _req("POST", path, data=data, token=token)

def get(path, token=None, params=None):
    return _req("GET", path, token=token, params=params)

def patch(path, data=None, token=None):
    return _req("PATCH", path, data=data, token=token)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _admin_token():
    res = post("/api/v1/auth/login",
               {"email": "admin@placement.local", "password": "admin123"})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def _register_student(suffix=None):
    s = suffix or uuid.uuid4().hex[:6]
    res = post("/api/v1/auth/register/student", {
        "full_name": f"FBStud {s}",
        "email": f"fbstud_{s}@feedback.com",
        "password": "pass",
        "roll_number": f"FB{s}",
        "branch": "CS",
        "cgpa": 8.0,
        "graduation_year": 2025,
    })
    assert res.status_code in (200, 201), res.text
    token = res.json()["access_token"]
    
    # Update profile to set CGPA
    patch_res = _req("PATCH", "/api/v1/students/me", token=token, data={
        "cgpa": 8.0,
        "batch_year": 2025,
        "branch": "CS"
    })
    assert patch_res.status_code == 200, patch_res.text
    
    return token, s


def _register_and_approve_company(admin_token, suffix=None):
    s = suffix or uuid.uuid4().hex[:6]
    res = post("/api/v1/auth/register/company", {
        "email": f"fbcomp_{s}@feedback.com",
        "password": "pass",
        "company_name": f"FBCo {s}",
    })
    assert res.status_code in (200, 201), res.text
    t = res.json()["access_token"]
    me = get("/api/v1/companies/me", token=t)
    cid = me.json()["id"]
    patch(f"/api/v1/companies/{cid}/approve", token=admin_token)
    return t, cid, s


def _create_and_approve_job(comp_token, admin_token):
    res = post("/api/v1/jobs/", token=comp_token, data={
        "title": "Dev",
        "description": "Feedback testing job",
        "required_skills": ["Python"],
        "min_cgpa": 6.0,
        "vacancies": 2,
        "application_deadline": "2035-12-31T00:00:00Z",
    })
    assert res.status_code in (200, 201), res.text
    jid = res.json()["id"]
    patch(f"/api/v1/jobs/{jid}/approve", token=admin_token)
    return jid


def _upload_cv(stud_token):
    res = _req("PUT", "/api/v1/cv/me", token=stud_token, data={
        "summary": "This is a test CV",
        "skills": ["Python", "FastAPI"],
        "academic_record": {"cgpa": 8.0}
    })
    assert res.status_code in (200, 201), res.text
    return res


def _apply(stud_token, job_id):
    res = post("/api/v1/applications/", token=stud_token, data={"job_id": job_id})
    assert res.status_code in (200, 201), res.text
    return res.json()["id"]


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestFeedbackAcceptance:
    def setup_method(self):
        self.admin = _admin_token()
        self.stud_token, self.s_sfx = _register_student()
        self.comp_token, self.comp_id, self.c_sfx = _register_and_approve_company(self.admin)
        self.job_id = _create_and_approve_job(self.comp_token, self.admin)
        _upload_cv(self.stud_token)
        self.app_id = _apply(self.stud_token, self.job_id)

    # --- Happy paths ---

    def test_student_feedback_for_company_success(self):
        res = post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "company",
            "target_id": self.comp_id,
            "content": "Great experience overall!",
            "rating": 4,
        })
        assert res.status_code in (200, 201), res.text
        body = res.json()
        assert body["target_type"] == "company"
        assert body["content"] == "Great experience overall!"
        assert body["rating"] == 4

    def test_company_feedback_for_student_success(self):
        me_res = get("/api/v1/students/me", token=self.stud_token)
        assert me_res.status_code == 200, me_res.text
        stud_id = me_res.json()["id"]
        res = post("/api/v1/feedback/", token=self.comp_token, data={
            "target_type": "student",
            "target_id": stud_id,
            "content": "Strong technical candidate.",
            "rating": 5,
        })
        assert res.status_code in (200, 201), res.text
        assert res.json()["target_type"] == "student"

    def test_student_feedback_with_job_id(self):
        res = post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "company",
            "target_id": self.comp_id,
            "job_id": self.job_id,
            "content": "The job listing was accurate.",
            "rating": 3,
        })
        assert res.status_code in (200, 201), res.text

    # --- SRS exception cases (R.8-E1) ---

    def test_feedback_missing_content_rejected(self):
        res = post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "company",
            "target_id": self.comp_id,
            "rating": 3,
        })
        assert res.status_code == 422, res.text

    def test_feedback_blank_content_rejected(self):
        res = post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "company",
            "target_id": self.comp_id,
            "content": "   ",
            "rating": 3,
        })
        assert res.status_code == 422, res.text

    def test_student_feedback_no_prior_application_rejected(self):
        _, other_comp_id, _ = _register_and_approve_company(self.admin)
        res = post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "company",
            "target_id": other_comp_id,
            "content": "Never interacted with them.",
            "rating": 2,
        })
        assert res.status_code == 400, res.text

    def test_company_feedback_no_prior_application_rejected(self):
        fresh_token, _ = _register_student()
        fresh_id = get("/api/v1/students/me", token=fresh_token).json()["id"]
        res = post("/api/v1/feedback/", token=self.comp_token, data={
            "target_type": "student",
            "target_id": fresh_id,
            "content": "No prior interaction.",
            "rating": 1,
        })
        assert res.status_code == 400, res.text

    def test_student_cannot_review_nonexistent_job(self):
        res = post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "job",
            "target_id": str(uuid.uuid4()),
            "content": "Fake job reference.",
            "rating": 2,
        })
        assert res.status_code in (400, 404), res.text

    def test_invalid_rating_rejected(self):
        for bad in [0, 6, -1]:
            res = post("/api/v1/feedback/", token=self.stud_token, data={
                "target_type": "company",
                "target_id": self.comp_id,
                "content": "Bad rating test.",
                "rating": bad,
            })
            assert res.status_code == 422, f"Expected 422 for rating={bad}, got {res.status_code}"

    # --- Admin list & filter ---

    def test_admin_list_feedback(self):
        post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "company",
            "target_id": self.comp_id,
            "content": "For admin list test.",
            "rating": 3,
        })
        res = get("/api/v1/feedback/", token=self.admin)
        assert res.status_code == 200, res.text
        assert isinstance(res.json(), list)

    def test_non_admin_cannot_list_feedback(self):
        for tok in (self.stud_token, self.comp_token):
            res = get("/api/v1/feedback/", token=tok)
            assert res.status_code == 403, res.text

    def test_admin_filter_flagged(self):
        res = get("/api/v1/feedback/", token=self.admin, params="flagged=true")
        assert res.status_code == 200, res.text
        assert isinstance(res.json(), list)

    # --- Flag + audit log (Rule 3) ---

    def _plant_feedback(self):
        r = post("/api/v1/feedback/", token=self.stud_token, data={
            "target_type": "company",
            "target_id": self.comp_id,
            "content": "Feedback for flagging test.",
            "rating": 3,
        })
        assert r.status_code in (200, 201), r.text
        return r.json()["id"]

    def test_admin_flag_creates_audit_log(self):
        from app.db.session import SessionLocal
        from app.models.users import User
        from app.models.cv import CV
        from app.models.audit import AuditLog

        fb_id = self._plant_feedback()
        res = patch(f"/api/v1/feedback/{fb_id}/flag", token=self.admin,
                    data={"flagged": True})
        assert res.status_code == 200, res.text
        assert res.json()["flagged"] is True

        db = SessionLocal()
        try:
            log = (
                db.query(AuditLog)
                .filter(AuditLog.action == "flag_feedback")
                .order_by(AuditLog.created_at.desc())
                .first()
            )
            assert log is not None, "AuditLog entry missing for flag_feedback"
        finally:
            db.close()

    def test_admin_unflag_toggles_back(self):
        fb_id = self._plant_feedback()
        patch(f"/api/v1/feedback/{fb_id}/flag", token=self.admin, data={"flagged": True})
        res = patch(f"/api/v1/feedback/{fb_id}/flag", token=self.admin, data={"flagged": False})
        assert res.status_code == 200, res.text
        assert res.json()["flagged"] is False

    def test_flag_nonexistent_feedback(self):
        res = patch(f"/api/v1/feedback/{uuid.uuid4()}/flag", token=self.admin,
                    data={"flagged": True})
        assert res.status_code == 404, res.text

    def test_company_cannot_flag_feedback(self):
        fb_id = self._plant_feedback()
        res = patch(f"/api/v1/feedback/{fb_id}/flag", token=self.comp_token,
                    data={"flagged": True})
        assert res.status_code == 403, res.text

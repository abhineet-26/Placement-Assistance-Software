from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.api.endpoints import auth, students, cv, companies, jobs, applications, matching, notifications, interviews, offers, feedback, admin
from app.core.auth import require_role, require_approved_company
from app.schemas.auth import TokenPayload
from app.models.users import User

app = FastAPI(
    title="Placement Assistant Software API",
    description="API for the Placement Assistant platform",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
app.include_router(cv.router, prefix="/api/v1/cv", tags=["cv"])
app.include_router(companies.router, prefix="/api/v1/companies", tags=["companies"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["applications"])
app.include_router(matching.router, prefix="/api/v1/jobs", tags=["matching"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(interviews.router, prefix="/api/v1/interviews", tags=["interviews"])
app.include_router(offers.router, prefix="/api/v1/offers", tags=["offers"])
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["feedback"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/v1/company/dashboard")
def company_dashboard_dummy(user: User = Depends(require_approved_company)):
    return {"message": "Company Dashboard"}

@app.get("/api/v1/admin/dashboard")
def admin_dashboard_dummy(token: TokenPayload = Depends(require_role(["admin"]))):
    return {"message": "Admin Dashboard"}

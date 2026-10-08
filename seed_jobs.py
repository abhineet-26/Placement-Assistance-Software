import sys
import os
sys.path.append("/app")

from app.db.session import SessionLocal
from app.models.job import JobRequirement, JobStatusEnum
from app.models.users import Company, User, Student
from app.models.cv import CV
from datetime import datetime, timedelta

def seed_jobs():
    db = SessionLocal()
    company = db.query(Company).first()
    if not company:
        print("No company found.")
        return

    admin = db.query(User).filter_by(role="admin").first()

    now = datetime.utcnow()
    new_jobs = [
        JobRequirement(
            company_id=company.id,
            title="Software Engineer Intern",
            description="Looking for an energetic intern for 6 months.",
            required_skills=["Python", "React", "FastAPI"],
            min_cgpa=7.0,
            allowed_branches=["CSE", "IT"],
            vacancies=5,
            application_deadline=now + timedelta(days=7),
            status=JobStatusEnum.published,
            reviewed_by=admin.admin.id if (admin and admin.admin) else None
        ),
        JobRequirement(
            company_id=company.id,
            title="Data Scientist",
            description="Work on cutting edge AI models.",
            required_skills=["Python", "PyTorch", "SQL"],
            min_cgpa=8.0,
            allowed_branches=["CSE", "ECE"],
            vacancies=2,
            application_deadline=now + timedelta(days=14),
            status=JobStatusEnum.published,
            reviewed_by=admin.admin.id if (admin and admin.admin) else None
        )
    ]
    
    db.add_all(new_jobs)
    db.commit()
    print(f"Added {len(new_jobs)} active jobs with future deadlines.")
    db.close()

if __name__ == "__main__":
    seed_jobs()

import asyncio
import os
import sys

# Ensure we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timedelta
from app.db.session import SessionLocal
from app.models.job import JobRequirement, JobStatusEnum
from app.models.users import Company
from app.models.cv import CV

async def seed_active_jobs():
    db = SessionLocal()
    
    # Get all companies
    companies = db.query(Company).all()
    if not companies:
        print("No companies found to assign jobs to.")
        return

    company_1 = companies[0]
    company_2 = companies[1] if len(companies) > 1 else company_1
    
    jobs = [
        JobRequirement(
            company_id=company_1.id,
            title="Software Engineer - Backend (Active)",
            description="Looking for an active backend developer.",
            required_skills=["Python", "Django", "PostgreSQL"],
            min_cgpa=7.5,
            allowed_branches=["CSE", "IT"],
            application_deadline=datetime.utcnow() + timedelta(days=7),
            status=JobStatusEnum.published,
            vacancies=5
        ),
        JobRequirement(
            company_id=company_1.id,
            title="Data Scientist (Active)",
            description="Looking for a data scientist.",
            required_skills=["Python", "Machine Learning", "Pandas"],
            min_cgpa=8.0,
            allowed_branches=["CSE", "DSAI"],
            application_deadline=datetime.utcnow() + timedelta(days=14),
            status=JobStatusEnum.published,
            vacancies=2
        ),
        JobRequirement(
            company_id=company_2.id,
            title="Frontend Developer (Active)",
            description="React and TypeScript expert needed.",
            required_skills=["React", "TypeScript", "CSS"],
            min_cgpa=7.0,
            allowed_branches=["CSE", "IT", "ECE"],
            application_deadline=datetime.utcnow() + timedelta(days=10),
            status=JobStatusEnum.published,
            vacancies=3
        )
    ]
    
    for job in jobs:
        db.add(job)
        
    db.commit()
    print("Successfully seeded active jobs with future deadlines.")

if __name__ == "__main__":
    asyncio.run(seed_active_jobs())

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'api'))

from app.db.session import SessionLocal
from app.db.base import *
from app.models.users import User, RoleEnum
from app.models.job import JobRequirement, JobStatusEnum
from datetime import datetime, timedelta

def main():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("Users in database:")
        for u in users:
            print(f"- {u.email} (Role: {u.role})")
            
        # Also add some active jobs
        import uuid
        
        # Get a company user or create a dummy one for jobs
        company_user = db.query(User).filter(User.role == RoleEnum.company).first()
        if company_user and company_user.company:
            print(f"Adding active jobs for company: {company_user.company.company_name}")
            
            new_job1 = JobRequirement(
                id=uuid.uuid4(),
                company_id=company_user.company.id,
                title="Software Engineer Intern (Active)",
                description="This is an active job posting for summer internship.",
                required_skills=["Python", "React"],
                vacancies=3,
                application_deadline=datetime.utcnow() + timedelta(days=10),
                status=JobStatusEnum.published
            )
            
            new_job2 = JobRequirement(
                id=uuid.uuid4(),
                company_id=company_user.company.id,
                title="Frontend Developer (Active)",
                description="We are looking for a frontend dev.",
                required_skills=["TypeScript", "React", "CSS"],
                vacancies=1,
                application_deadline=datetime.utcnow() + timedelta(days=14),
                status=JobStatusEnum.published
            )
            
            db.add(new_job1)
            db.add(new_job2)
            db.commit()
            print("Successfully added 2 active jobs.")
        else:
            print("No company found to associate jobs with.")
            
    finally:
        db.close()

if __name__ == "__main__":
    main()

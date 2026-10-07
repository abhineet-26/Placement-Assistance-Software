import asyncio
import sys
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

from app.db.session import SessionLocal
from app.models.users import User, RoleEnum, Company, Student, Admin, ApprovalStatusEnum
from app.models.job import JobRequirement, JobStatusEnum
from app.models.cv import CV

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_db():
    db = SessionLocal()
    
    # 1. Admin
    admin_email = "admin@demo.com"
    if not db.query(User).filter(User.email == admin_email).first():
        admin = User(email=admin_email, password_hash=get_password_hash("admin123"), role=RoleEnum.admin)
        db.add(admin)
        db.commit()
        db.refresh(admin)
        admin_profile = Admin(user_id=admin.id, full_name="System Admin")
        db.add(admin_profile)
        db.commit()
        print("Created admin user")

    # 2. Company
    comp_email = "techcorp@demo.com"
    if not db.query(User).filter(User.email == comp_email).first():
        comp_user = User(email=comp_email, password_hash=get_password_hash("company123"), role=RoleEnum.company, is_active=True)
        db.add(comp_user)
        db.commit()
        db.refresh(comp_user)
        company = Company(
            user_id=comp_user.id,
            company_name="TechCorp",
            contact_person="Alice Smith",
            contact_phone="1234567890",
            about="A demo tech company",
            approval_status=ApprovalStatusEnum.approved
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        print("Created company user")
        
        # Job
        job = JobRequirement(
            company_id=company.id,
            title="Software Engineer",
            description="Build amazing things",
            required_skills=["Python", "React", "Docker"],
            min_cgpa=8.0,
            status=JobStatusEnum.published, # Ensure it is published so students can see
            vacancies=5,
            application_deadline="2027-01-01T00:00:00Z"
        )
        db.add(job)
        db.commit()
        print("Created company job")

    # 3. Student
    stud_email = "student@demo.com"
    if not db.query(User).filter(User.email == stud_email).first():
        stud_user = User(email=stud_email, password_hash=get_password_hash("student123"), role=RoleEnum.student, is_active=True)
        db.add(stud_user)
        db.commit()
        db.refresh(stud_user)
        student = Student(
            user_id=stud_user.id,
            roll_number="DEMO001",
            full_name="Bob Jones",
            phone="0987654321",
            programme="B.Tech",
            branch="CSE",
            batch_year=2025,
            cgpa=9.0
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        print("Created student user")
        
        # CV
        cv = CV(
            student_id=student.id,
            summary="Passionate software engineering student",
            academic_record=[{"degree": "B.Tech", "institution": "Demo University"}],
            skills=["Python", "FastAPI", "React"]
        )
        db.add(cv)
        db.commit()
        print("Created student CV")
        
    print("Database seeding completed.")
    db.close()

if __name__ == "__main__":
    seed_db()

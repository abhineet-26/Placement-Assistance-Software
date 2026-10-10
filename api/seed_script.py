
from app.db.session import SessionLocal
from app.models.users import User, RoleEnum, Student, Company, Admin, ApprovalStatusEnum
from app.models.job import JobRequirement, JobStatusEnum
from app.models.cv import CV
from datetime import datetime, timedelta
from app.core.security import get_password_hash
from sqlalchemy import text

db = SessionLocal()

# Check if database is already seeded
existing_admin = db.query(User).filter(User.email == "admin@demo.com").first()
if existing_admin:
    print("Database already seeded. Skipping.")
    exit(0)

# Delete all tables (truncate) - only happens if not seeded
db.execute(text("TRUNCATE TABLE applications, job_requirements, companies, students, admins, users CASCADE"))
db.commit()

# Create Admin
admin = User(email="admin@demo.com", password_hash=get_password_hash("password"), role=RoleEnum.admin, is_active=True)
db.add(admin)
db.commit()
admin_prof = Admin(user_id=admin.id, full_name="Admin Test")
db.add(admin_prof)
db.flush()

# Create Test Admin for automated tests
test_admin = User(email="admin@placement.local", password_hash=get_password_hash("admin123"), role=RoleEnum.admin, is_active=True)
db.add(test_admin)
db.commit()
test_admin_prof = Admin(user_id=test_admin.id, full_name="Test Admin")
db.add(test_admin_prof)

# Create Student
student = User(email="student@demo.com", password_hash=get_password_hash("password"), role=RoleEnum.student, is_active=True)
db.add(student)
db.commit()
student_prof = Student(user_id=student.id, full_name="Test Student", roll_number="12345", cgpa=8.5, branch="CSE", backlogs=0)
db.add(student_prof)

# Create Approved Company
company = User(email="techcorp@demo.com", password_hash=get_password_hash("password"), role=RoleEnum.company, is_active=True)
db.add(company)
db.commit()
company_prof = Company(user_id=company.id, company_name="Tech Corp", about="Tech Co", approval_status=ApprovalStatusEnum.approved)
db.add(company_prof)
db.flush()

# Create Job Posting 1
job1 = JobRequirement(
    company_id=company_prof.id,
    title="Software Engineer",
    description="Looking for a passionate Software Engineer to join our team.",
    required_skills=["Python", "React", "SQL"],
    min_cgpa=7.5,
    allowed_branches=["CSE", "IT", "ECE"],
    max_backlogs=1,
    vacancies=10,
    application_deadline=datetime.utcnow() + timedelta(days=30),
    status=JobStatusEnum.published,
    reviewed_by=admin_prof.id
)
db.add(job1)

# Create Job Posting 2
job2 = JobRequirement(
    company_id=company_prof.id,
    title="Data Scientist",
    description="Looking for a Data Scientist with experience in Machine Learning.",
    required_skills=["Python", "TensorFlow", "Pandas"],
    min_cgpa=8.0,
    allowed_branches=["CSE", "IT"],
    max_backlogs=0,
    vacancies=5,
    application_deadline=datetime.utcnow() + timedelta(days=15),
    status=JobStatusEnum.published,
    reviewed_by=admin_prof.id
)
db.add(job2)

db.commit()
print("Database seeded successfully")

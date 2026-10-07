
from app.db import base
from app.db.session import SessionLocal
from app.models.users import User, RoleEnum, Student, Company, Admin, ApprovalStatusEnum
from app.core.security import get_password_hash
from sqlalchemy import text

db = SessionLocal()

# Delete all tables (truncate)
db.execute(text("TRUNCATE TABLE applications, job_requirements, companies, students, admins, users CASCADE"))
db.commit()

# Create Admin
admin = User(email="admin@test.com", password_hash=get_password_hash("password"), role=RoleEnum.admin, is_active=True)
db.add(admin)
db.commit()
admin_prof = Admin(user_id=admin.id, full_name="Admin Test")
db.add(admin_prof)

# Create Student
student = User(email="student@test.com", password_hash=get_password_hash("password"), role=RoleEnum.student, is_active=True)
db.add(student)
db.commit()
student_prof = Student(user_id=student.id, full_name="Test Student", roll_number="12345", cgpa=8.5, branch="CSE", backlogs=0)
db.add(student_prof)

# Create Approved Company
company = User(email="company@test.com", password_hash=get_password_hash("password"), role=RoleEnum.company, is_active=True)
db.add(company)
db.commit()
company_prof = Company(user_id=company.id, company_name="Test Company", about="Tech Co", approval_status=ApprovalStatusEnum.approved)
db.add(company_prof)

db.commit()
print("Database seeded successfully")

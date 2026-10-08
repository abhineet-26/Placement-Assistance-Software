from app.db.session import SessionLocal
from app.models.users import User, RoleEnum, Admin
from app.core.security import get_password_hash

db = SessionLocal()

# Check if admin@placement.local exists
if not db.query(User).filter(User.email == "admin@placement.local").first():
    admin = User(email="admin@placement.local", password_hash=get_password_hash("admin123"), role=RoleEnum.admin, is_active=True)
    db.add(admin)
    db.commit()
    admin_prof = Admin(user_id=admin.id, full_name="Admin Test")
    db.add(admin_prof)
    db.commit()
    print("Test Admin created")
else:
    print("Test Admin already exists")

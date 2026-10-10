import os
import sys
from pathlib import Path
from sqlalchemy.orm import Session

sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.users import User, Admin, RoleEnum
from app.core.security import get_password_hash

def seed_admin():
    db: Session = SessionLocal()
    admin_email = "admin@placement.local"
    
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"Admin {admin_email} already exists.")
        return
    
    user = User(
        email=admin_email,
        password_hash=get_password_hash("admin123"),
        role=RoleEnum.admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    admin_profile = Admin(
        user_id=user.id,
        full_name="System Administrator"
    )
    db.add(admin_profile)
    db.commit()
    print(f"Created admin {admin_email} with password 'admin123'")

if __name__ == "__main__":
    seed_admin()

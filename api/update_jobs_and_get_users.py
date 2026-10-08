import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from app.db.session import SessionLocal
from app.models.users import User, RoleEnum
from app.models.job import Job
from datetime import datetime, timedelta

def main():
    db = SessionLocal()
    
    print("--- USERS ---")
    users = db.query(User).all()
    for u in users:
        print(f"ID: {u.id} | Email: {u.email} | Role: {u.role.value}")
        
    print("\n--- UPDATING JOBS ---")
    jobs = db.query(Job).all()
    count = 0
    now = datetime.utcnow()
    future_date = now + timedelta(days=14)
    for j in jobs:
        if j.deadline is None or j.deadline < now:
            j.deadline = future_date
            count += 1
    db.commit()
    print(f"Updated {count} jobs to have deadline in the future.")
    
    db.close()

if __name__ == "__main__":
    main()

import asyncio
from datetime import datetime, timedelta
from app.db.session import async_session
from app.models.users import User
from app.models.job import Job
from sqlalchemy.future import select

async def main():
    async with async_session() as session:
        # List users
        print("Users in DB:")
        result = await session.execute(select(User))
        users = result.scalars().all()
        for u in users:
            print(f"- {u.email} (Role: {u.role})")
        
        # Update jobs
        print("\nUpdating jobs...")
        result = await session.execute(select(Job))
        jobs = result.scalars().all()
        now = datetime.utcnow()
        for i, j in enumerate(jobs):
            # Make sure at least a few jobs are active (deadline in 14 days)
            if i % 2 == 0:
                j.application_deadline = now + timedelta(days=14)
                print(f"Updated job {j.title} deadline to {j.application_deadline}")
            else:
                j.application_deadline = now - timedelta(days=1)
        await session.commit()
        print("Done updating jobs.")

if __name__ == "__main__":
    asyncio.run(main())

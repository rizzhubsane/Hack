import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Add parent directory to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config import settings
from app.models import User, Provider, Service, Appointment
from app.utils.security import get_password_hash

# Setup DB connection
engine = create_async_engine(settings.database_url)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def migrate_users(file_path: str, session: AsyncSession):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    for line in lines:
        parts = line.strip().split("::")
        if len(parts) >= 2:
            username = parts[0].strip()
            password = parts[1].strip()
            
            # Check if exists
            result = await session.execute(select(User).where(User.username == username))
            if result.scalars().first():
                print(f"Skipping existing user: {username}")
                continue
                
            user = User(
                username=username,
                email=f"{username}@example.com", # Placeholder
                password_hash=get_password_hash(password)
            )
            session.add(user)
            print(f"Migrated user: {username}")
    
    await session.commit()

async def migrate_providers(file_path: str, session: AsyncSession):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    for line in lines:
        parts = line.strip().split("::")
        if len(parts) >= 4:
            name = parts[0].strip()
            profession = parts[1].strip()
            username = parts[2].strip()
            password = parts[3].strip()
            
            # Check if exists
            result = await session.execute(select(Provider).where(Provider.username == username))
            if result.scalars().first():
                print(f"Skipping existing provider: {username}")
                continue
            
            provider = Provider(
                name=name,
                username=username,
                profession=profession,
                password_hash=get_password_hash(password)
            )
            session.add(provider)
            print(f"Migrated provider: {username}")
            
    await session.commit()

async def main():
    async with AsyncSessionLocal() as session:
        print("Starting migration...")
        
        # Paths to legacy files - assume they are in the root or specified folder
        users_file = "users.txt"
        providers_file = "service_providers.txt"
        
        await migrate_users(users_file, session)
        await migrate_providers(providers_file, session)
        
        print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(main())

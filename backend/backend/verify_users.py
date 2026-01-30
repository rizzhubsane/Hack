import asyncio
from sqlalchemy import select
from app.database.db import AsyncSessionLocal
from app.models.provider import Provider
from app.models.user import User

async def list_users():
    print("Hashing 'password123' check:")
    from app.utils.security import verify_password, get_password_hash
    test_hash = get_password_hash("password123")
    print(f"Test verify: {verify_password('password123', test_hash)}")

    async with AsyncSessionLocal() as session:
        print("\n--- PROVIDERS ---")
        result = await session.execute(select(Provider))
        for p in result.scalars().all():
            print(f"Username: '{p.username}'")
            print(f"Hash: {p.password_hash}")
            is_valid = verify_password("password123", p.password_hash)
            print(f"Password 'password123' valid? {is_valid}")
            
        print("\n--- USERS ---")
        result = await session.execute(select(User))
        for u in result.scalars().all():
             print(f"Username: '{u.username}', Email: '{u.email}'")

if __name__ == "__main__":
    asyncio.run(list_users())

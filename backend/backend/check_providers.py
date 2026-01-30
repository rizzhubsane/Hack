import asyncio
from sqlalchemy import select
from app.database.db import AsyncSessionLocal
from app.models.provider import Provider

async def list_providers():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Provider))
        print("=== PROVIDERS IN DATABASE ===")
        for p in result.scalars().all():
            print(f"Username: {p.username}")
            print(f"Name: {p.name}")
            print(f"Profession: {p.profession}")
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(list_providers())

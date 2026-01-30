from app.database.db import engine, Base
import app.models

import asyncio

print("Creating database tables...")

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
from sqlalchemy import select
from app.database.db import AsyncSessionLocal, engine, Base
from app.models.provider import Provider
from app.models.service import Service
from app.utils.security import get_password_hash

async def seed_data():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Seeding data...")
    async with AsyncSessionLocal() as session:
        # Check if providers exist
        result = await session.execute(select(Provider))
        if result.scalars().first():
            print("Providers already exist. Skipping seed.")
            return

        # 1. Create Providers
        providers_data = [
            {"u": "beautyspa", "n": "Luxe Beauty Parlour", "p": "Beauty Parlour"},
            {"u": "citydoctor", "n": "City Medical Center", "p": "Doctor"},
            {"u": "legalexpert", "n": "Justice Law Firm", "p": "Lawyer"},
            {"u": "brightsmile", "n": "Bright Smile Dental", "p": "Dentist"},
        ]
        
        for p_data in providers_data:
            provider = Provider(
                username=p_data["u"],
                password_hash=get_password_hash("password123"),
                name=p_data["n"],
                profession=p_data["p"],
                is_active=True
            )
            session.add(provider)
        
        await session.commit()
        print("Providers created.")

        # 2. Fetch Providers to get IDs (Safe way)
        provider_map = {}
        result = await session.execute(select(Provider))
        for p in result.scalars().all():
            provider_map[p.profession] = p.id
            
        # 3. Create Services
        services_data = [
             # Beauty Parlour
            {"n": "Haircut", "p": "Beauty Parlour", "d": 30, "pr": 25.0},
            {"n": "Facial", "p": "Beauty Parlour", "d": 60, "pr": 45.0},
            {"n": "Massage", "p": "Beauty Parlour", "d": 60, "pr": 50.0},
            
            # Doctor
            {"n": "General Consultation", "p": "Doctor", "d": 15, "pr": 75.0},
            {"n": "Comprehensive Check-up", "p": "Doctor", "d": 60, "pr": 150.0},
            {"n": "Follow-up Visit", "p": "Doctor", "d": 15, "pr": 50.0},
            
            # Lawyer
            {"n": "Initial Consultation", "p": "Lawyer", "d": 60, "pr": 200.0},
            {"n": "Document Review", "p": "Lawyer", "d": 45, "pr": 150.0},
            {"n": "Legal Advice Session", "p": "Lawyer", "d": 30, "pr": 120.0},
            
            # Dentist
            {"n": "Dental Check-up", "p": "Dentist", "d": 30, "pr": 80.0},
            {"n": "Teeth Cleaning", "p": "Dentist", "d": 45, "pr": 100.0},
            {"n": "Cavity Filling", "p": "Dentist", "d": 60, "pr": 150.0},
        ]

        for s_data in services_data:
            provider_id = provider_map.get(s_data["p"])
            if provider_id:
                service = Service(
                    name=s_data["n"],
                    profession=s_data["p"],
                    duration=s_data["d"],
                    price=s_data["pr"],
                    provider_id=provider_id
                )
                session.add(service)
            else:
                print(f"Warning: Provider for {s_data['p']} not found")
        
        await session.commit()
        print("Services seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())

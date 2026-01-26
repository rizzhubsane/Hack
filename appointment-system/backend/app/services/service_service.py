from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Service
from app.schemas.service import ServiceCreate

async def create_service(db: AsyncSession, service: ServiceCreate):
    db_service = Service(**service.model_dump())
    db.add(db_service)
    await db.commit()
    await db.refresh(db_service)
    return db_service

async def get_services(db: AsyncSession, profession: str = None):
    query = select(Service)
    if profession:
        query = query.where(Service.profession == profession)
    result = await db.execute(query)
    return result.scalars().all()

async def get_services_by_provider(db: AsyncSession, provider_id: int):
    # Depending on logic, provider services might be explicitly linked or generic.
    # Current model allows provider_id to be null or set.
    # Logic: Get services specifically for this provider OR generic services for their profession?
    # Prompt says: "GET /services/profession/{profession}"
    # "PUT /providers/{id}/services" - implies provider specific list.
    pass 
    # For now, let's implement get by profession as primary.

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models import Provider
from typing import List, Optional

async def get_providers(
    db: AsyncSession, 
    profession: Optional[str] = None, 
    search_query: Optional[str] = None
) -> List[Provider]:
    query = select(Provider).where(Provider.is_active == True)
    
    if profession:
        query = query.where(Provider.profession == profession)
    
    if search_query:
        query = query.where(
            or_(
                Provider.name.ilike(f"%{search_query}%"),
                Provider.profession.ilike(f"%{search_query}%")
            )
        )
        
    result = await db.execute(query)
    return result.scalars().all()

async def get_provider(db: AsyncSession, provider_id: int):
    result = await db.execute(select(Provider).where(Provider.id == provider_id))
    return result.scalars().first()

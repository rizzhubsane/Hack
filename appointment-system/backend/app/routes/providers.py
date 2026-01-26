from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database.db import get_db
from app.schemas.provider import ProviderResponse
from app.services import provider_service
from app.routes.deps import get_current_provider

router = APIRouter(prefix="/providers", tags=["Providers"])

@router.get("/", response_model=List[ProviderResponse])
async def list_providers(
    profession: Optional[str] = None, 
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await provider_service.get_providers(db, profession, search)

@router.get("/me", response_model=ProviderResponse)
async def read_provider_me(current_provider: ProviderResponse = Depends(get_current_provider)):
    return current_provider

@router.get("/{provider_id}", response_model=ProviderResponse)
async def read_provider(provider_id: int, db: AsyncSession = Depends(get_db)):
    provider = await provider_service.get_provider(db, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

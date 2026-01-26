from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.schemas.service import ServiceResponse, ServiceCreate
from app.services import service_service
from app.routes.deps import get_current_provider
from app.schemas.provider import ProviderResponse

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("/profession/{profession}", response_model=List[ServiceResponse])
async def get_services_by_profession(profession: str, db: AsyncSession = Depends(get_db)):
    return await service_service.get_services(db, profession)

@router.post("/", response_model=ServiceResponse)
async def create_service(
    service: ServiceCreate, 
    db: AsyncSession = Depends(get_db),
    # Only providers (or admins) can create services?
    # Prompt: "admin/provider"
    current_provider: ProviderResponse = Depends(get_current_provider) 
):
    if service.provider_id is None:
        service.provider_id = current_provider.id
    return await service_service.create_service(db, service)

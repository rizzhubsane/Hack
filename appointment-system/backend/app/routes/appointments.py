from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.schemas.appointment import AppointmentResponse, AppointmentCreate, AppointmentUpdate
from app.services import appointment_service
from app.routes.deps import get_current_user, get_current_provider
from app.schemas.user import UserResponse
from app.schemas.provider import ProviderResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/book", response_model=AppointmentResponse)
async def book_appointment(
    appointment: AppointmentCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await appointment_service.create_appointment(db, appointment, current_user.id)

@router.get("/user/me", response_model=List[AppointmentResponse])
async def get_my_appointments(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await appointment_service.get_user_appointments(db, current_user.id)

@router.get("/provider/me", response_model=List[AppointmentResponse])
async def get_provider_appointments(
    current_provider: ProviderResponse = Depends(get_current_provider),
    db: AsyncSession = Depends(get_db)
):
    return await appointment_service.get_provider_appointments(db, current_provider.id)

# Only providers should verify/update status?
@router.patch("/{id}/status", response_model=AppointmentResponse)
async def update_status(
    id: int,
    status_update: AppointmentUpdate,
    current_provider: ProviderResponse = Depends(get_current_provider), # Enforce provider
    db: AsyncSession = Depends(get_db)
):
    if not status_update.status:
         raise HTTPException(status_code=400, detail="Status required")
    return await appointment_service.update_appointment_status(db, id, status_update.status)

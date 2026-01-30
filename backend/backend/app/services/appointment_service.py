from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime
from app.models import Appointment, AppointmentStatus, User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from fastapi import HTTPException

async def get_next_token(db: AsyncSession, provider_id: int, date: datetime.date):
    # Get max token for provider on this date
    # Note: date_time is DateTime, we need to filter by date
    # In SQLite, checking date(date_time) works, in Postgres same.
    # However, for SQLAlchemy sync/async portability, let's filter by range.
    start_of_day = datetime.combine(date, datetime.min.time())
    end_of_day = datetime.combine(date, datetime.max.time())
    
    query = select(func.max(Appointment.token_number)).where(
        Appointment.provider_id == provider_id,
        Appointment.date_time >= start_of_day,
        Appointment.date_time <= end_of_day
    )
    result = await db.execute(query)
    max_token = result.scalar()
    return (max_token or 0) + 1

async def create_appointment(db: AsyncSession, appointment: AppointmentCreate, user_id: int):
    # Check if slot is available (simplified: just generate token for now)
    # Real availability check requires checking provider's schedule and existing appointments
    # For now, we just append to the queue (Token system context).
    
    token = await get_next_token(db, appointment.provider_id, appointment.date_time.date())
    
    db_appointment = Appointment(
        user_id=user_id,
        provider_id=appointment.provider_id,
        service_name=appointment.service_name,
        date_time=appointment.date_time,
        token_number=token,
        status=AppointmentStatus.SCHEDULED
    )
    db.add(db_appointment)
    
    # Update user's total appointments
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    if user:
        user.total_appointments += 1
    
    await db.commit()
    await db.refresh(db_appointment)
    return db_appointment

async def get_user_appointments(db: AsyncSession, user_id: int):
    result = await db.execute(select(Appointment).where(Appointment.user_id == user_id))
    return result.scalars().all()

async def get_provider_appointments(db: AsyncSession, provider_id: int):
    result = await db.execute(select(Appointment).where(Appointment.provider_id == provider_id))
    return result.scalars().all()

async def update_appointment_status(db: AsyncSession, appointment_id: int, status: str):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalars().first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = status
    if status == AppointmentStatus.IN_PROGRESS:
        appointment.started_at = datetime.utcnow()
    elif status == AppointmentStatus.COMPLETED:
        appointment.completed_at = datetime.utcnow()
        # Calculate duration?
        
    await db.commit()
    await db.refresh(appointment)
    return appointment

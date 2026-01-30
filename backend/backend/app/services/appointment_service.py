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
        
    await db.refresh(appointment)
    return appointment

async def call_next_customer(db: AsyncSession, provider_id: int):
    # 1. Find currently serving appointment
    today = datetime.now().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    current_stmt = select(Appointment).where(
        Appointment.provider_id == provider_id,
        Appointment.status == AppointmentStatus.IN_PROGRESS,
        Appointment.date_time >= start_of_day,
        Appointment.date_time <= end_of_day
    )
    result = await db.execute(current_stmt)
    current_appt = result.scalars().first()
    
    # 2. Complete current if exists
    if current_appt:
        current_appt.status = AppointmentStatus.COMPLETED
        current_appt.completed_at = datetime.utcnow()
        
    # 3. Find next waiting appointment (ordered by time/token)
    next_stmt = select(Appointment).where(
        Appointment.provider_id == provider_id,
        Appointment.status == AppointmentStatus.SCHEDULED,
        Appointment.date_time >= start_of_day,
        Appointment.date_time <= end_of_day
    ).order_by(Appointment.token_number.asc())
    
    result = await db.execute(next_stmt)
    next_appt = result.scalars().first()
    
    if next_appt:
        next_appt.status = AppointmentStatus.IN_PROGRESS
        next_appt.started_at = datetime.utcnow()
        await db.commit()
        await db.refresh(next_appt)
        return next_appt
    
    await db.commit()
    return None

async def finish_current_appointment(db: AsyncSession, provider_id: int):
    today = datetime.now().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    current_stmt = select(Appointment).where(
        Appointment.provider_id == provider_id,
        Appointment.status == AppointmentStatus.IN_PROGRESS,
        Appointment.date_time >= start_of_day,
        Appointment.date_time <= end_of_day
    )
    result = await db.execute(current_stmt)
    current_appt = result.scalars().first()
    
    if current_appt:
        current_appt.status = AppointmentStatus.COMPLETED
        current_appt.completed_at = datetime.utcnow()
        await db.commit()
        await db.refresh(current_appt)
        return current_appt
        
    return None

async def get_queue_position(db: AsyncSession, appointment_id: int):
    # Get the appointment
    stmt = select(Appointment).where(Appointment.id == appointment_id)
    result = await db.execute(stmt)
    my_appt = result.scalars().first()
    
    if not my_appt or my_appt.status != AppointmentStatus.SCHEDULED:
        return {"position": 0, "wait_time": 0, "current_token": 0, "your_token": 0}
        
    # Get currently serving token
    today = my_appt.date_time.date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    current_stmt = select(Appointment).where(
        Appointment.provider_id == my_appt.provider_id,
        Appointment.status == AppointmentStatus.IN_PROGRESS,
        Appointment.date_time >= start_of_day,
        Appointment.date_time <= end_of_day
    )
    result = await db.execute(current_stmt)
    current_appt = result.scalars().first()
    
    current_token = current_appt.token_number if current_appt else 0
    
    # If no one is serving, find the last completed one to guess where we are
    if current_token == 0:
        last_stmt = select(func.max(Appointment.token_number)).where(
             Appointment.provider_id == my_appt.provider_id,
             Appointment.status == AppointmentStatus.COMPLETED,
             Appointment.date_time >= start_of_day,
             Appointment.date_time <= end_of_day
        )
        last_result = await db.execute(last_stmt)
        last_token = last_result.scalar() or 0
        current_token = last_token
        
    people_ahead = max(0, my_appt.token_number - current_token - 1)
    
    # Estimate wait time (e.g. 15 mins per person)
    wait_time = people_ahead * 15
    
    return {
        "position": people_ahead, 
        "wait_time": wait_time, 
        "current_token": current_token, 
        "your_token": my_appt.token_number
    }

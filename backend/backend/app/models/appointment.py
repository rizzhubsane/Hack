from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
import enum
from app.database.db import Base

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False, index=True)
    service_name = Column(String, nullable=False)
    
    date_time = Column(DateTime(timezone=True), nullable=False)
    token_number = Column(Integer, nullable=False)
    status = Column(String, default=AppointmentStatus.SCHEDULED, nullable=False)
    
    price = Column(Float, nullable=True)
    actual_duration = Column(Float, nullable=True) # minutes
    user_rating = Column(Integer, nullable=True) # 1-5
    user_showed_up = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class AppointmentBase(BaseModel):
    provider_id: int
    service_name: str
    date_time: datetime

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: int
    user_id: int
    token_number: int
    status: AppointmentStatus
    price: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    user_rating: Optional[int] = None

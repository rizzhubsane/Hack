from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    phone: Optional[str] = None
    preferred_profession: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    preferred_profession: Optional[str] = None

class UserResponse(UserBase):
    id: int
    avg_rating: float
    created_at: datetime

    class Config:
        from_attributes = True

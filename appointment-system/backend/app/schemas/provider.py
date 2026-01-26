from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProviderBase(BaseModel):
    username: str
    name: str
    profession: str
    credentials: Optional[str] = None

class ProviderCreate(ProviderBase):
    password: str

class ProviderResponse(ProviderBase):
    id: int
    avg_rating: float
    popularity_score: float
    completion_rate: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

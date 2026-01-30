from pydantic import BaseModel
from typing import Optional

class ServiceBase(BaseModel):
    name: str
    profession: str
    duration: int
    price: float
    provider_id: Optional[int] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int
    avg_actual_duration: float
    popularity_score: float

    class Config:
        from_attributes = True

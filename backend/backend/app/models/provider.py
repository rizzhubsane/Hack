from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.db import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, unique=True, index=True, nullable=False)
    profession = Column(String, index=True, nullable=False)
    credentials = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    
    # ML Features
    avg_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    avg_service_time = Column(Float, default=0.0)
    popularity_score = Column(Float, default=0.0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./appointment_system.db"
    
    # Security
    secret_key: str = "PleaseChangeMeInProduction"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # ML Models
    ml_models_path: str = "./ml_models"
    min_training_samples: int = 50
    retrain_interval_hours: int = 24
    
    # Business Rules
    business_hours_start: int = 9
    business_hours_end: int = 17
    slot_interval_minutes: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()

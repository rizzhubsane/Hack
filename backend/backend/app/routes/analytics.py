from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.ml.wait_time_predictor import wait_time_predictor
from app.models import Appointment
from datetime import datetime
import pandas as pd

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/wait-time/predict")
async def predict_wait_time(
    provider_id: int, 
    current_token: int, 
    user_token: int, 
    db: AsyncSession = Depends(get_db)
):
    if not wait_time_predictor.is_trained:
        await wait_time_predictor.train(db)
        
    current_time = pd.Timestamp(datetime.now())
    estimated_minutes = wait_time_predictor.predict(current_token, user_token, current_time)
    
    return {
        "provider_id": provider_id,
        "current_token": current_token,
        "your_token": user_token,
        "estimated_wait_minutes": round(estimated_minutes, 1)
    }

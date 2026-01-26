import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Appointment

class WaitTimePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100)
        self.is_trained = False
        
    async def train(self, db: AsyncSession):
        # Fetch completed appointments
        result = await db.execute(select(Appointment).where(
            Appointment.status == "COMPLETED",
            Appointment.actual_duration.isnot(None),
            Appointment.started_at.isnot(None)
        ))
        appointments = result.scalars().all()
        
        if len(appointments) < 10: # Min samples
            print("Not enough data to train wait time predictor.")
            return

        data = []
        for apt in appointments:
            if not apt.started_at:
                continue
                
            # Feature engineering
            hour = apt.date_time.hour
            day_of_week = apt.date_time.weekday()
            # Approximation of tokens ahead: for now using token_number as proxy
            # In reality, we'd reconstruct the state at that time.
            tokens_ahead = apt.token_number - 1 # Simple approximation
            
            data.append({
                "hour": hour,
                "day_of_week": day_of_week,
                "tokens_ahead": tokens_ahead,
                "actual_duration": apt.actual_duration
            })
            
        df = pd.DataFrame(data)
        if df.empty:
            return

        X = df[["hour", "day_of_week", "tokens_ahead"]]
        y = df["actual_duration"]
        
        self.model.fit(X, y)
        self.is_trained = True
        print("Wait time predictor trained.")

    def predict(self, current_token: int, user_token: int, appointment_time: pd.Timestamp):
        if not self.is_trained:
            # Fallback heuristic: 15 mins per person ahead
            tokens_ahead = max(0, user_token - current_token)
            return tokens_ahead * 15.0
            
        tokens_ahead = max(0, user_token - current_token)
        hour = appointment_time.hour
        day_of_week = appointment_time.weekday()
        
        X_pred = pd.DataFrame([{
            "hour": hour,
            "day_of_week": day_of_week,
            "tokens_ahead": tokens_ahead
        }])
        
        predicted_duration = self.model.predict(X_pred)[0]
        # Total wait = duration of serving current + (tokens_ahead * predicted_avg_duration)
        # Simplified: predicted duration for the wait itself? 
        # The model usually predicts *service duration* or *wait time* directly.
        # If trained on actual wait time (started_at - scheduled_at/arrival), it predicts wait.
        # If trained on service duration, we multiply.
        # Implementation above uses 'actual_duration' which is service time.
        # So wait time ~= tokens_ahead * predicted_service_time
        
        return tokens_ahead * predicted_duration

wait_time_predictor = WaitTimePredictor()

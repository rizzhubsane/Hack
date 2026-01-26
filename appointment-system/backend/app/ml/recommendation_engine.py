import pandas as pd
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sklearn.metrics.pairwise import cosine_similarity
from app.models import Appointment, User, Provider, Service
from typing import List, Dict

class RecommendationEngine:
    def __init__(self):
        self.user_provider_matrix = None
        self.provider_features = None
        self.is_trained = False

    async def train(self, db: AsyncSession):
        # Fetch data
        appointments_result = await db.execute(select(
            Appointment.user_id, Appointment.provider_id, Appointment.user_rating
        ).where(Appointment.status == "COMPLETED"))
        appointments = appointments_result.all()
        
        if not appointments:
            print("Not enough data to train recommendation engine.")
            return

        df = pd.DataFrame(appointments, columns=['user_id', 'provider_id', 'rating'])
        
        # Collaborative filtering matrix
        self.user_provider_matrix = df.pivot_table(
            index='user_id', columns='provider_id', values='rating'
        ).fillna(0)
        
        self.is_trained = True
        print("Recommendation engine trained.")

    async def get_recommendations(self, db: AsyncSession, user_id: int, profession: str = None, top_n: int = 5) -> List[int]:
        if not self.is_trained or self.user_provider_matrix is None:
            # Fallback to popularity based
            query = select(Provider).order_by(Provider.avg_rating.desc()).limit(top_n)
            if profession:
                query = query.where(Provider.profession == profession)
            result = await db.execute(query)
            return [p.id for p in result.scalars().all()]
        
        # Collaborative Filtering Logic (User-based)
        if user_id not in self.user_provider_matrix.index:
             # New user -> Popularity fallback
            print("User not in matrix, falling back to popularity")
            query = select(Provider).order_by(Provider.avg_rating.desc())
            if profession:
                query = query.where(Provider.profession == profession)
            result = await db.execute(query)
            return [p.id for p in result.scalars().all()[:top_n]]

        # Find similar users
        user_vector = self.user_provider_matrix.loc[user_id].values.reshape(1, -1)
        similarities = cosine_similarity(self.user_provider_matrix, user_vector)
        similar_users_indices = similarities.flatten().argsort()[::-1][1:6] # Top 5 similar users
        
        similar_users_ids = self.user_provider_matrix.index[similar_users_indices]
        
        # Aggregated ratings from similar users
        relevant_ratings = self.user_provider_matrix.loc[similar_users_ids]
        mean_ratings = relevant_ratings.mean(axis=0)
        
        # Sort providers by predicted rating
        recommended_provider_ids = mean_ratings.sort_values(ascending=False).index.tolist()
        
        # Filter by profession if needed
        final_recommendations = []
        for pid in recommended_provider_ids:
            if len(final_recommendations) >= top_n:
                break
            # Verify profession
            prov = await db.get(Provider, int(pid)) # pid might be numpy int
            if prov and (not profession or prov.profession == profession):
                final_recommendations.append(prov.id)
                
        # If we don't have enough, fill with popularity
        if len(final_recommendations) < top_n:
            query = select(Provider).order_by(Provider.avg_rating.desc())
            if profession:
                query = query.where(Provider.profession == profession)
            remaining = await db.execute(query)
            for p in remaining.scalars().all():
                if p.id not in final_recommendations:
                    final_recommendations.append(p.id)
                    if len(final_recommendations) >= top_n:
                        break
                        
        return final_recommendations

recommendation_engine = RecommendationEngine()

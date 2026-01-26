from fastapi import APIRouter, Depends, Query
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.schemas.provider import ProviderResponse
from app.ml.recommendation_engine import recommendation_engine
from app.models import Provider

router = APIRouter(prefix="/recommendations", tags=["ML Recommendations"])

@router.get("/providers", response_model=List[ProviderResponse])
async def recommend_providers(
    user_id: int, 
    profession: str = None, 
    top_n: int = 5, 
    db: AsyncSession = Depends(get_db)
):
    # Trigger lightweight training check or just use current state
    # In production, training happens in background.
    # checking if trained purely for demo:
    if not recommendation_engine.is_trained:
        await recommendation_engine.train(db)
        
    recommended_ids = await recommendation_engine.get_recommendations(db, user_id, profession, top_n)
    
    # Fetch provider details
    providers = []
    for pid in recommended_ids:
        prov = await db.get(Provider, pid)
        if prov:
            providers.append(prov)
            
    return providers

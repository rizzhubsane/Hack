from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.provider import ProviderCreate, ProviderResponse
from app.schemas.token import Token
from app.services import auth_service
from app.utils.security import create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/user", response_model=UserResponse)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await auth_service.create_user(db, user)

@router.post("/register/provider", response_model=ProviderResponse)
async def register_provider(provider: ProviderCreate, db: AsyncSession = Depends(get_db)):
    return await auth_service.create_provider(db, provider)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user_or_provider, user_type = await auth_service.authenticate_user_or_provider(db, form_data.username, form_data.password)
    if not user_or_provider:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user_or_provider.username, "type": user_type, "id": user_or_provider.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_type": user_type,
        "user_id": user_or_provider.id,
        "username": user_or_provider.username
    }

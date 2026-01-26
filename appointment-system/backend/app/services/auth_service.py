from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models import User, Provider
from app.schemas.user import UserCreate
from app.schemas.provider import ProviderCreate
from app.utils.security import get_password_hash, verify_password

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_provider_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(Provider).where(Provider.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate):
    existing = await get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    db_user = User(
        username=user.username,
        email=user.email,
        phone=user.phone,
        preferred_profession=user.preferred_profession,
        password_hash=get_password_hash(user.password)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def create_provider(db: AsyncSession, provider: ProviderCreate):
    existing = await get_provider_by_username(db, provider.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    db_provider = Provider(
        username=provider.username,
        name=provider.name,
        profession=provider.profession,
        credentials=provider.credentials,
        password_hash=get_password_hash(provider.password)
    )
    db.add(db_provider)
    await db.commit()
    await db.refresh(db_provider)
    return db_provider

async def authenticate_user_or_provider(db: AsyncSession, username: str, password: str):
    # Try User first
    user = await get_user_by_username(db, username)
    if user and verify_password(password, user.password_hash):
        return user, "user"
    
    # Try Provider
    provider = await get_provider_by_username(db, username)
    if provider and verify_password(password, provider.password_hash):
        return provider, "provider"
        
    return None, None

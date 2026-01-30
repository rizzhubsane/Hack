import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.db import get_db, Base, engine

# Override dependency for testing if needed, but for now using the same DB (or a test DB)
# Ideally use a separate test DB.
# For simplicity in this environment, using a test.db
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_appointment_system.db"

test_engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False, autocommit=False, autoflush=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_register_user():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/register/user", json={
            "username": "testuser",
            "password": "testpassword",
            "email": "test@example.com"
        })
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

@pytest.mark.asyncio
async def test_login_user():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/auth/register/user", json={
            "username": "loginuser",
            "password": "loginpassword",
            "email": "login@example.com"
        })
        
        response = await ac.post("/auth/login", data={
            "username": "loginuser",
            "password": "loginpassword"
        })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["user_type"] == "user"

@pytest.mark.asyncio
async def test_register_provider():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/register/provider", json={
            "username": "doc1",
            "password": "docpassword",
            "name": "Dr. House",
            "profession": "Diagnostician"
        })
    assert response.status_code == 200
    assert response.json()["username"] == "doc1"

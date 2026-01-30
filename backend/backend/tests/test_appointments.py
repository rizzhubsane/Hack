import pytest
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timedelta
from app.main import app
from app.database.db import get_db, Base, engine
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
async def test_book_appointment():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register User
        await ac.post("/auth/register/user", json={
            "username": "patient1",
            "password": "password",
            "email": "p1@example.com"
        })
        # Login User
        login_res = await ac.post("/auth/login", data={"username": "patient1", "password": "password"})
        token = login_res.json()["access_token"]
        
        # Register Provider
        provider_res = await ac.post("/auth/register/provider", json={
            "username": "doc1",
            "password": "password",
            "name": "Dr. Strange",
            "profession": "Surgeon"
        })
        provider_id = provider_res.json()["id"]
        
        # Book Appointment
        headers = {"Authorization": f"Bearer {token}"}
        book_res = await ac.post("/appointments/book", json={
            "provider_id": provider_id,
            "service_name": "Surgery",
            "date_time": (datetime.utcnow() + timedelta(days=1)).isoformat()
        }, headers=headers)
        
    assert book_res.status_code == 200
    assert book_res.json()["token_number"] == 1
    assert book_res.json()["status"] == "SCHEDULED"

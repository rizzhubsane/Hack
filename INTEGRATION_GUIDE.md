# Appointment System - Frontend & Backend Integration Guide

## 📋 Overview

This guide provides complete instructions for integrating your React frontend with the FastAPI backend for the online appointment and queue tracking system.

## 🏗️ Project Structure

```
appointment-system/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Your existing main file
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── providers.py
│   │   │   ├── services.py
│   │   │   ├── appointments.py
│   │   │   ├── recommendations.py
│   │   │   └── analytics.py
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── database.py        # Database connection
│   ├── requirements.txt
│   └── .env
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── AppointmentSystem.jsx
│   │   ├── services/
│   │   │   └── api-service.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
```

## 🚀 Backend Setup

### 1. Install Dependencies

Add these to your `backend/requirements.txt`:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
websockets==12.0
redis==5.0.1  # For queue management
```

Install:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/appointment_db
# or for SQLite during development:
# DATABASE_URL=sqlite:///./appointment.db

# Security
SECRET_KEY=your-secret-key-here-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000

# Redis (for queue management)
REDIS_URL=redis://localhost:6379

# Server
API_VERSION=v1
```

### 3. Update main.py with CORS

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, users, providers, services, appointments, recommendations, analytics
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Appointment System API",
    description="Online Appointment and Queue Tracking System with AI Recommendations",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with API versioning
API_VERSION = os.getenv("API_VERSION", "v1")
app.include_router(auth.router, prefix=f"/api/{API_VERSION}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"/api/{API_VERSION}/users", tags=["Users"])
app.include_router(providers.router, prefix=f"/api/{API_VERSION}/providers", tags=["Providers"])
app.include_router(services.router, prefix=f"/api/{API_VERSION}/services", tags=["Services"])
app.include_router(appointments.router, prefix=f"/api/{API_VERSION}/appointments", tags=["Appointments"])
app.include_router(recommendations.router, prefix=f"/api/{API_VERSION}/recommendations", tags=["Recommendations"])
app.include_router(analytics.router, prefix=f"/api/{API_VERSION}/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Appointment System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 4. Database Models Example

Create `backend/app/models/appointment.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider_id = Column(Integer, ForeignKey("providers.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    date = Column(String)
    time = Column(String)
    status = Column(String, default="upcoming")  # upcoming, completed, cancelled
    queue_position = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="appointments")
    provider = relationship("Provider", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    location = Column(String)
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    avg_wait_time = Column(Integer, default=0)  # in minutes
    queue_length = Column(Integer, default=0)
    icon = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    services = relationship("Service", back_populates="provider")
    appointments = relationship("Appointment", back_populates="provider")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"))
    name = Column(String, index=True)
    duration = Column(Integer)  # in minutes
    price = Column(Float)
    category = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    provider = relationship("Provider", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")
```

### 5. WebSocket for Queue Updates

Create `backend/app/routes/websocket.py`:

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, appointment_id: int):
        await websocket.accept()
        if appointment_id not in self.active_connections:
            self.active_connections[appointment_id] = []
        self.active_connections[appointment_id].append(websocket)

    def disconnect(self, websocket: WebSocket, appointment_id: int):
        if appointment_id in self.active_connections:
            self.active_connections[appointment_id].remove(websocket)

    async def send_queue_update(self, appointment_id: int, data: dict):
        if appointment_id in self.active_connections:
            for connection in self.active_connections[appointment_id]:
                await connection.send_json(data)

manager = ConnectionManager()

@router.websocket("/ws/queue/{appointment_id}")
async def queue_websocket(websocket: WebSocket, appointment_id: int):
    await manager.connect(websocket, appointment_id)
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            # You can handle incoming messages here if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, appointment_id)
```

Add to `main.py`:
```python
from app.routes import websocket
app.include_router(websocket.router)
```

### 6. Example Route Implementation

Example `backend/app/routes/appointments.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.routes.websocket import manager

router = APIRouter()

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db)
):
    # Create appointment
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Update queue
    # ... queue logic here ...
    
    # Notify via WebSocket
    await manager.send_queue_update(db_appointment.id, {
        "type": "new_appointment",
        "appointment_id": db_appointment.id
    })
    
    return db_appointment

@router.get("/user/{user_id}", response_model=List[AppointmentResponse])
async def get_user_appointments(
    user_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment).filter(Appointment.user_id == user_id)
    if status:
        query = query.filter(Appointment.status == status)
    return query.all()

@router.post("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = "cancelled"
    db.commit()
    
    return {"message": "Appointment cancelled successfully"}
```

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install lucide-react
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 2. Project Structure

```
src/
├── components/
│   └── AppointmentSystem.jsx    # Main component
├── services/
│   └── api-service.js            # API integration
├── App.js
└── index.js
```

### 3. Setup App.js

```javascript
import React from 'react';
import AppointmentSystem from './components/AppointmentSystem';
import './App.css';

function App() {
  return (
    <div className="App">
      <AppointmentSystem />
    </div>
  );
}

export default App;
```

## 🔄 Running the Application

### Start Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend

```bash
cd frontend
npm start
```

Application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📡 API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Providers
- `GET /api/v1/providers` - Get all providers
- `GET /api/v1/providers/{id}` - Get provider details
- `GET /api/v1/providers/search?q=query` - Search providers
- `GET /api/v1/providers/{id}/availability?date=2024-01-30` - Get availability
- `GET /api/v1/providers/{id}/queue` - Get queue status

### Services
- `GET /api/v1/services` - Get all services
- `GET /api/v1/services/{id}` - Get service details
- `GET /api/v1/services?provider_id={id}` - Get provider services

### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/user/{user_id}` - Get user appointments
- `GET /api/v1/appointments/{id}` - Get appointment details
- `POST /api/v1/appointments/{id}/cancel` - Cancel appointment
- `POST /api/v1/appointments/{id}/reschedule` - Reschedule appointment

### Recommendations
- `GET /api/v1/recommendations/user/{user_id}` - Get user recommendations
- `GET /api/v1/recommendations/trending` - Get trending services

### Analytics
- `GET /api/v1/analytics/user/{user_id}` - Get user analytics
- `POST /api/v1/analytics/track` - Track user action

## 🔧 Testing the Integration

1. **Test Authentication**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Test Provider Listing**:
   ```bash
   curl http://localhost:8000/api/v1/providers
   ```

3. **Test Booking**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/appointments \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": 1,
       "provider_id": 1,
       "service_id": 1,
       "date": "2024-01-30",
       "time": "10:00"
     }'
   ```

## 🐛 Troubleshooting

### CORS Issues
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS middleware configuration in `main.py`

### WebSocket Connection Issues
- Ensure WebSocket endpoint is properly configured
- Check firewall/proxy settings

### Authentication Issues
- Verify JWT token is being sent in requests
- Check token expiration settings

## 📚 Next Steps

1. Implement proper authentication flow
2. Add payment gateway integration
3. Set up email notifications
4. Implement real-time queue updates with Redis
5. Add comprehensive error handling
6. Set up logging and monitoring
7. Add unit and integration tests
8. Deploy to production

## 🔐 Security Considerations

- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Use prepared statements for database queries
- Implement proper session management
- Add CSRF protection
- Sanitize user inputs

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [WebSocket Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Made with ❤️ for seamless appointment booking**

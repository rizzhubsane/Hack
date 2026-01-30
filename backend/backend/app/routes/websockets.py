from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
import json
import asyncio
from app.services import appointment_service
from app.database.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Appointment

router = APIRouter(prefix="/ws", tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        # Store active connections: appointment_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, appointment_id: str):
        await websocket.accept()
        if appointment_id not in self.active_connections:
            self.active_connections[appointment_id] = []
        self.active_connections[appointment_id].append(websocket)

    def disconnect(self, websocket: WebSocket, appointment_id: str):
        if appointment_id in self.active_connections:
            if websocket in self.active_connections[appointment_id]:
                self.active_connections[appointment_id].remove(websocket)
            if not self.active_connections[appointment_id]:
                del self.active_connections[appointment_id]

    async def broadcast(self, message: dict, appointment_id: str):
        if appointment_id in self.active_connections:
            for connection in self.active_connections[appointment_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message: {e}")

manager = ConnectionManager()

@router.websocket("/queue/{appointment_id}")
async def websocket_endpoint(websocket: WebSocket, appointment_id: str):
    # Note: In a real app, we should validate the token passed in query params
    # token = websocket.query_params.get("token")
    
    await manager.connect(websocket, appointment_id)
    try:
        # Send initial state
        # In a real implementation, we would fetch the current queue position

        # Get current appointment from DB
        initial_update = None
        async for session in get_db():
             # In a real app we'd query the queue for this provider
             # For now, just show the appointment status
             stmt = select(Appointment).where(Appointment.id == int(appointment_id))
             result = await session.execute(stmt)
             appointment = result.scalars().first()
             
             if appointment:
                 initial_update = {
                    "type": "update",
                    "queue": [
                        {
                            "position": appointment.token_number,
                            "name": "You",
                            "status": appointment.status,
                            "eta": "Calculating...",
                            "highlight": True
                        }
                    ]
                 }
             break
        
        if initial_update:
            await websocket.send_json(initial_update)
        else:
            await websocket.send_json({"error": "Appointment not found"})
        
        # Keep connection alive
        while True:
            # Wait for any client messages (optional, mostly for keepalive)
            data = await websocket.receive_text()
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, appointment_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, appointment_id)

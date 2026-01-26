from fastapi import FastAPI
from app.routes import auth, users, providers, services, appointments, recommendations, analytics

app = FastAPI(title="Appointment System API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(providers.router)
app.include_router(services.router)
app.include_router(appointments.router)
app.include_router(recommendations.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Appointment System API"}

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database.db import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    profession = Column(String, index=True, nullable=False)
    duration = Column(Integer, nullable=False) # in minutes
    price = Column(Float, nullable=False)
    
    # ML Features
    avg_actual_duration = Column(Float, default=0.0)
    popularity_score = Column(Float, default=0.0)
    demand_score = Column(Float, default=0.0)
    
    # Optional: link to specific provider if services are provider-specific, 
    # but the prompt implies generic services or provider services.
    # Assuming services are generic by profession for now, or we can add provider_id optionally.
    # Let's add provider_id if the user wants provider-specific services.
    # The prompt says: "GET /services/profession/{profession}" and "POST /services - Create new service (admin/provider)"
    # Also "PUT /providers/{id}/services - Update services".
    # This implies services might be linked to providers or there's a many-to-many.
    # For simplicity based on prompt "Services Table: id, profession, name...", it looks global.
    # But providers update services. Let's make it simple: 
    # Defined services that providers can "offer" or just generic services?
    # "Appointments Table: service_name". 
    # I will add an optional provider_id so a provider can define their own custom service, 
    # or leave null for global services.
    
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)

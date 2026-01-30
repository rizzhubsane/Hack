from app.models.provider import Provider
from app.database.db import Base

print(f"Tablename: '{Provider.__tablename__}'")
try:
    print(f"Table Name from Metadata: '{Provider.__table__.name}'")
except Exception as e:
    print(f"Error accessing table metadata: {e}")

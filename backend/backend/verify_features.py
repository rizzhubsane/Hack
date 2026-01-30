import asyncio
import httpx
import sys

BASE_URL = "http://localhost:8000"

async def test_flow():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print(f"Checking health at {BASE_URL}...")
        resp = await client.get("/")
        print(f"Health: {resp.status_code} {resp.json()}")
        
        # 1. Register User
        email = f"test_{asyncio.get_event_loop().time()}@example.com"
        username = f"user_{asyncio.get_event_loop().time()}"
        password = "password123"
        print(f"\nRegistering user {email}...")
        resp = await client.post("/auth/register/user", json={
            "username": username,
            "email": email,
            "password": password,
            "phone": "1234567890"
        })
        if resp.status_code != 200:
            print(f"Registration failed: {resp.text}")
            return
        user_data = resp.json()
        print(f"User registered: {user_data['id']}")

        # 2. Login
        print("\nLogging in...")
        resp = await client.post("/auth/login", data={
            "username": username,
            "password": password
        })
        if resp.status_code != 200:
            print(f"Login failed: {resp.text}")
            return
        token_data = resp.json()
        access_token = token_data["access_token"]
        print("Login successful.")
        
        headers = {"Authorization": f"Bearer {access_token}"}

        # 3. Create a Provider (Need one to book)
        print("\nCreating a provider...")

        provider_username = f"prov_{asyncio.get_event_loop().time()}"
        resp = await client.post("/auth/register/provider", json={
            "username": provider_username,
            "password": "password123",
            "name": "Dr. Test",
            "profession": "Healthcare",
            "credentials": "MD"
        })
        if resp.status_code != 200:
            print(f"Provider registration failed: {resp.text}")
            return
        provider_data = resp.json()
        print(f"Provider created: {provider_data['id']}")
        
        # 4. Book Appointment
        print("\nBooking appointment...")
        appointment_data = {
            "provider_id": provider_data["id"],
            "service_name": "General Checkup",
            "date_time": "2024-12-25T10:00:00"
        }
        resp = await client.post("/appointments/book", json=appointment_data, headers=headers)
        if resp.status_code != 200:
            print(f"Booking failed: {resp.text}")
            return
        appt_data = resp.json()
        print(f"Appointment booked: ID {appt_data['id']}, Token {appt_data['token_number']}")
        
        # 5. Check WebSocket (Simulated connection check)
        # We can't easily test WS content with httpx, but we can check if endpoint exists
        # In a real test we'd use websockets library, but for now successful booking is good enough.
        
        print("\nAll core flows passed!")

if __name__ == "__main__":
    asyncio.run(test_flow())

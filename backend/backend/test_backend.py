import requests

# Test the backend login endpoint
url = "http://localhost:8000/auth/login"
data = {
    "username": "citydoctor",
    "password": "password123"
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

import urllib.request
import urllib.parse
import json

url = "http://localhost:8000/auth/login"
data = urllib.parse.urlencode({
    "username": "citydoctor",
    "password": "password123"
}).encode()

req = urllib.request.Request(url, data=data, method="POST")
req.add_header("Content-Type", "application/x-www-form-urlencoded")

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")

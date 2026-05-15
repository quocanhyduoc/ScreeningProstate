import requests
import json

URL = "http://localhost:8000/registration"

payload = {
    "full_name": "Test Patient",
    "dob": "1970-01-01T00:00:00",
    "cccd": "123456789012",
    "phone": "0905111222",
    "email": "test@example.com",
    "province": "Thành phố Huế",
    "district": "Quận Hải Châu",
    "ward": "Phường Thạch Thang",
    "address_detail": "123 Street",
    "appointment_slot": "7:00-11:30 ngày 30/5 (Thứ 7)",
    "history_father": True,
    "history_brother": False,
    "family_history": True,
    "symptoms": "None",
    "consent": True,
    "is_extra_slot": False
}

try:
    response = requests.post(URL, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

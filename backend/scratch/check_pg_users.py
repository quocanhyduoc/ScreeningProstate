import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models import User

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"Username: {u.username}, Role: {u.role}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()

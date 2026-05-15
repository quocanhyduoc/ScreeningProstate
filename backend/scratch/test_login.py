import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models import User
from app.auth import verify_password, get_password_hash

def test_login(username, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"User '{username}' not found.")
            return
        
        is_correct = verify_password(password, user.hashed_password)
        print(f"Login test for '{username}': {'SUCCESS' if is_correct else 'FAILED'}")
        
        # Also print the hash for debugging (carefully)
        # print(f"Stored hash: {user.hashed_password}")
        # print(f"New hash for same password: {get_password_hash(password)}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_login("admin", "admin@2026")
    test_login("btc", "btc@2026")
    test_login("urology", "urology@2026")
    test_login("cskh", "cskh@2026")

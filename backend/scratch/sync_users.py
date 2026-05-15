import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import engine, SessionLocal
from app.models import User
from app.auth import get_password_hash

def ensure_users():
    db = SessionLocal()
    try:
        users_to_create = [
            ("admin", "admin@2026", "SUPERADMIN"),
            ("urology", "urology@2026", "UROLOGY"),
            ("cskh", "cskh@2026", "CSKH"),
            ("btc", "btc@2026", "BTC")
        ]
        
        for username, password, role in users_to_create:
            user = db.query(User).filter(User.username == username).first()
            if not user:
                user = User(
                    username=username,
                    hashed_password=get_password_hash(password),
                    role=role
                )
                db.add(user)
                print(f"✅ Created user: {username} ({role})")
            else:
                print(f"ℹ️ User {username} already exists.")
        
        db.commit()
        print("✨ User synchronization complete.")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    ensure_users()

import os
import sys
from sqlalchemy.orm import Session

# Add the project root to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # 1. Ensure "admin" user exists with correct password and role
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("Creating default SUPERADMIN 'admin' user...")
            new_admin = User(
                username="admin",
                hashed_password=get_password_hash("admin@2026"),
                role="SUPERADMIN",
                permissions=["users", "settings", "reports", "calendar", "clinical_reception", "clinical_screening", "clinical_lab", "clinical_consult", "overview"]
            )
            db.add(new_admin)
            print("SUPERADMIN 'admin' created.")
        else:
            print("Updating SUPERADMIN 'admin' password and role...")
            admin_user.hashed_password = get_password_hash("admin@2026")
            admin_user.role = "SUPERADMIN"
            # Ensure all permissions are granted
            admin_user.permissions = ["users", "settings", "reports", "calendar", "clinical_reception", "clinical_screening", "clinical_lab", "clinical_consult", "overview"]
            print("SUPERADMIN 'admin' updated.")
        
        # 2. Remove redundant 'admin_clinical' or any other users
        other_admins = db.query(User).filter(User.username != "admin").all()
        for u in other_admins:
            print(f"Removing redundant user: {u.username}")
            db.delete(u)
            
        db.commit()
        print("Done! Only 'admin' remains as SUPERADMIN.")
        
    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()

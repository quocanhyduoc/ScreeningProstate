import os
import sys

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.username == "admin_clinical").first()
        if not admin_user:
            print("Creating default SUPERADMIN user...")
            new_admin = User(
                username="admin_clinical",
                hashed_password=get_password_hash("admin@2026"),
                role="SUPERADMIN",
                permissions=["users", "settings", "reports", "calendar", "clinical_reception", "clinical_screening", "clinical_lab", "clinical_consult"]
            )
            db.add(new_admin)
            db.commit()
            print("SUPERADMIN user created successfully.")
        else:
            print("SUPERADMIN user already exists. Updating password...")
            admin_user.hashed_password = get_password_hash("admin@2026")
            admin_user.role = "SUPERADMIN"
            db.commit()
            print("SUPERADMIN user updated successfully.")
            
        # Optional: Remove other users if requested (the user said "Only one account is created with superadmin role")
        # But maybe they just mean "Initially only one". I'll keep others for now unless specified.
        
    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()

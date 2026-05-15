
from app.database import SessionLocal, engine
from app.models import PatientRegistration, User, SystemSettings
from sqlalchemy import inspect

def check_db():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables: {tables}")
    
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        patient_count = db.query(PatientRegistration).count()
        settings = db.query(SystemSettings).first()
        
        print(f"User count: {user_count}")
        print(f"Patient count: {patient_count}")
        if settings:
            print(f"Settings: active={settings.registration_active}, limit={settings.registration_limit}")
        else:
            print("No settings found!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()

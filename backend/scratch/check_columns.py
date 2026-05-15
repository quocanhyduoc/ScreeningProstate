
from app.database import engine
from sqlalchemy import inspect

def check_columns():
    inspector = inspect(engine)
    columns = inspector.get_columns('patient_registrations')
    for col in columns:
        print(f"Column: {col['name']}, Type: {col['type']}")

if __name__ == "__main__":
    check_columns()

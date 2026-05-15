from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./screening.db")
engine = create_engine(DATABASE_URL)

def update_db():
    cols_to_add = [
        ("province", "VARCHAR DEFAULT 'Thừa Thiên Huế'"),
        ("district", "VARCHAR"),
        ("ward", "VARCHAR"),
        ("address_detail", "VARCHAR"),
        ("registration_number", "INTEGER"),
        ("is_extra_slot", "BOOLEAN DEFAULT 0"),
        ("consent", "BOOLEAN DEFAULT 0")
    ]
    
    with engine.connect() as conn:
        for col_name, col_type in cols_to_add:
            try:
                cmd = f"ALTER TABLE patient_registrations ADD COLUMN {col_name} {col_type};"
                print(f"Executing: {cmd}")
                conn.execute(text(cmd))
                conn.commit()
                print(f"Successfully added {col_name}")
            except Exception as e:
                if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                    print(f"Column {col_name} already exists, skipping.")
                else:
                    print(f"Error adding {col_name}: {e}")

if __name__ == "__main__":
    update_db()

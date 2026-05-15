import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import Base

def migrate():
    print("Migrating database: Adding cancer_treatment column to screening_surveys...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN cancer_treatment BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Successfully added cancer_treatment column.")
        except Exception as e:
            print(f"Error migrating: {e}")
            print("Likely column already exists or table doesn't exist yet.")

if __name__ == "__main__":
    migrate()

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.database import engine

def migrate():
    print("Migrating database: Splitting meds_hormones into meds_estrogen, meds_progesterone, meds_androgen...")
    with engine.connect() as conn:
        try:
            # Add new columns
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN meds_estrogen BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN meds_progesterone BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN meds_androgen BOOLEAN DEFAULT FALSE;"))
            
            # Migrate data from meds_hormones if it existed (optional, but good practice)
            # Check if meds_hormones exists first
            try:
                conn.execute(text("UPDATE screening_surveys SET meds_estrogen = meds_hormones, meds_progesterone = meds_hormones, meds_androgen = meds_hormones;"))
                conn.execute(text("ALTER TABLE screening_surveys DROP COLUMN meds_hormones;"))
                print("Migrated data from meds_hormones and dropped the old column.")
            except:
                print("meds_hormones column not found, skipping data migration.")
            
            conn.commit()
            print("Successfully updated hormone columns.")
        except Exception as e:
            print(f"Error migrating: {e}")

if __name__ == "__main__":
    migrate()

import os
import sys
from dotenv import load_dotenv

# Add the parent directory to sys.path so we can import app
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

load_dotenv(os.path.join(parent_dir, '.env'))

from app.database import engine
from sqlalchemy import text

def add_columns():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN is_psa_done BOOLEAN DEFAULT FALSE;"))
            print("Added is_psa_done column.")
        except Exception as e:
            print(f"Error or column already exists: {e}")
            
        try:
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN ultrasound_result TEXT;"))
            print("Added ultrasound_result column.")
        except Exception as e:
            print(f"Error or column already exists: {e}")
            
        try:
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN ultrasound_images JSON;"))
            print("Added ultrasound_images column.")
        except Exception as e:
            print(f"Error or column already exists: {e}")
            
        try:
            conn.execute(text("ALTER TABLE screening_surveys ADD COLUMN is_ultrasound_done BOOLEAN DEFAULT FALSE;"))
            print("Added is_ultrasound_done column.")
        except Exception as e:
            print(f"Error or column already exists: {e}")
            
        conn.commit()

if __name__ == "__main__":
    add_columns()
    print("Migration finished.")

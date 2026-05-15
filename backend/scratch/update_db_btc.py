import sqlite3
import os

db_path = "backend/screening.db"

if not os.path.exists(db_path):
    print("Database not found!")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create screening_surveys table
cursor.execute("""
CREATE TABLE IF NOT EXISTS screening_surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER UNIQUE,
    brca_mutation BOOLEAN DEFAULT 0,
    father_age_diag INTEGER,
    brother_age_diag INTEGER,
    exclusion_sex_24h BOOLEAN DEFAULT 0,
    exclusion_cystoscopy_48h BOOLEAN DEFAULT 0,
    exclusion_dre_1w BOOLEAN DEFAULT 0,
    biopsy_3y BOOLEAN DEFAULT 0,
    prostatectomy BOOLEAN DEFAULT 0,
    cancer_history TEXT,
    severe_organ_disease BOOLEAN DEFAULT 0,
    alzheimer BOOLEAN DEFAULT 0,
    other_studies BOOLEAN DEFAULT 0,
    meds_5alpha_inhibitor BOOLEAN DEFAULT 0,
    meds_hormones BOOLEAN DEFAULT 0,
    meds_corticoids BOOLEAN DEFAULT 0,
    meds_saw_palmetto BOOLEAN DEFAULT 0,
    symptom_difficulty BOOLEAN DEFAULT 0,
    symptom_frequency BOOLEAN DEFAULT 0,
    symptom_urgency BOOLEAN DEFAULT 0,
    symptom_incomplete BOOLEAN DEFAULT 0,
    symptom_dribbling BOOLEAN DEFAULT 0,
    symptom_bone_pain BOOLEAN DEFAULT 0,
    symptom_hematuria BOOLEAN DEFAULT 0,
    psa_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES patient_registrations (id)
)
""")

# Create queue_status table
cursor.execute("""
CREATE TABLE IF NOT EXISTS queue_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station TEXT UNIQUE,
    current_number INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_NUMBER
)
""")

# Initialize queue stations
stations = ['TIEP_NHAN', 'TU_VAN_SL', 'LAY_MAU', 'TRA_KQ']
for s in stations:
    cursor.execute("INSERT OR IGNORE INTO queue_status (station, current_number) VALUES (?, ?)", (s, 0))

conn.commit()
conn.close()
print("Database schema updated successfully for BTC workflow.")

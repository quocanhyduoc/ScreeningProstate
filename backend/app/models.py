from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # SUPERADMIN, UROLOGY, CSKH
    permissions = Column(JSON, nullable=True) # List of page/function IDs

class PatientRegistration(Base):
    __tablename__ = "patient_registrations"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    dob = Column(DateTime)
    cccd = Column(String, index=True)
    phone = Column(String, index=True)
    email = Column(String, nullable=True)
    province = Column(String, default="Thừa Thiên Huế")
    district = Column(String)
    ward = Column(String)
    address_detail = Column(String)
    history_father = Column(Boolean, default=False)
    history_brother = Column(Boolean, default=False)
    family_history = Column(Boolean, default=False) # Still used as a logical sum
    symptoms = Column(Text, nullable=True)
    age_at_endpoint = Column(Integer, nullable=True)
    appointment_slot = Column(String, nullable=True) # New field
    status = Column(String, default="CHO_XAC_NHAN") 
    consent = Column(Boolean, default=False)
    registration_number = Column(Integer, unique=True, index=True, nullable=True)
    is_extra_slot = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScreeningSurvey(Base):
    __tablename__ = "screening_surveys"
    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("patient_registrations.id"), unique=True)
    
    # Genetic & Family
    brca_mutation = Column(Boolean, default=False)
    father_age_diag = Column(Integer, nullable=True)
    brother_age_diag = Column(Integer, nullable=True)
    
    # Exclusions
    exclusion_sex_24h = Column(Boolean, default=False)
    exclusion_cystoscopy_48h = Column(Boolean, default=False)
    exclusion_dre_1w = Column(Boolean, default=False)
    
    # History
    biopsy_3y = Column(Boolean, default=False)
    prostatectomy = Column(Boolean, default=False)
    cancer_history = Column(JSON, nullable=True) # List of types
    cancer_treatment = Column(Boolean, default=False)
    severe_organ_disease = Column(Boolean, default=False)
    alzheimer = Column(Boolean, default=False)
    other_studies = Column(Boolean, default=False)
    
    # Medications
    meds_5alpha_inhibitor = Column(Boolean, default=False)
    meds_estrogen = Column(Boolean, default=False)
    meds_progesterone = Column(Boolean, default=False)
    meds_androgen = Column(Boolean, default=False)
    meds_corticoids = Column(Boolean, default=False)
    meds_saw_palmetto = Column(Boolean, default=False)
    
    # Symptoms
    symptom_difficulty = Column(Boolean, default=False)
    symptom_frequency = Column(Boolean, default=False)
    symptom_urgency = Column(Boolean, default=False)
    symptom_incomplete = Column(Boolean, default=False)
    symptom_dribbling = Column(Boolean, default=False)
    symptom_bone_pain = Column(Boolean, default=False)
    symptom_hematuria = Column(Boolean, default=False)
    
    psa_value = Column(String, nullable=True) # Result later
    is_psa_done = Column(Boolean, default=False)
    ultrasound_result = Column(Text, nullable=True)
    ultrasound_images = Column(JSON, nullable=True)
    is_ultrasound_done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class QueueStatus(Base):
    __tablename__ = "queue_status"
    id = Column(Integer, primary_key=True, index=True)
    station = Column(String, unique=True) # TIEP_NHAN, TU_VAN_SL, LAY_MAU, TRA_KQ
    current_number = Column(Integer, default=0)
    updated_at = Column(DateTime, onupdate=datetime.datetime.utcnow, default=datetime.datetime.utcnow)

class SystemSettings(Base):
    __tablename__ = "system_settings"
    id = Column(Integer, primary_key=True, index=True)
    registration_active = Column(Boolean, default=True)
    registration_limit = Column(Integer, default=300)

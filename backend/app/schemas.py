from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- PATIENT REGISTRATION SCHEMAS ---
class RegistrationBase(BaseModel):
    full_name: str
    dob: datetime
    cccd: str
    phone: str
    email: Optional[EmailStr] = None
    province: str = "Thừa Thiên Huế"
    district: str
    ward: str
    address_detail: str
    appointment_slot: Optional[str] = None # Added
    history_father: bool = False
    history_brother: bool = False
    family_history: bool = False
    symptoms: Optional[str] = None
    consent: bool = False
    is_extra_slot: bool = False

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationUpdate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[datetime] = None
    cccd: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    address_detail: Optional[str] = None
    appointment_slot: Optional[str] = None
    status: Optional[str] = None
    is_extra_slot: Optional[bool] = None

class RegistrationSchema(RegistrationBase):
    id: int
    age_at_endpoint: Optional[int] = None
    status: str
    phone_verified: bool
    registration_number: Optional[int] = None
    is_extra_slot: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- OTP SCHEMAS ---
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    code: str

# --- ADMIN & SYSTEM SCHEMAS ---
class SystemSettingsBase(BaseModel):
    registration_active: bool
    registration_limit: int

class SystemSettingsUpdate(BaseModel):
    registration_active: Optional[bool] = None
    registration_limit: Optional[int] = None

class SystemSettingsSchema(SystemSettingsBase):
    id: int
    class Config:
        from_attributes = True
class UserBase(BaseModel):
    username: str
    role: str
    permissions: Optional[List[str]] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    permissions: Optional[List[str]] = None

class UserSchema(UserBase):
    id: int
    class Config:
        from_attributes = True


# --- CLINICAL & ONSITE SCREENING SCHEMAS ---
class SurveyBase(BaseModel):
    brca_mutation: bool = False
    father_age_diag: Optional[int] = None
    brother_age_diag: Optional[int] = None
    exclusion_sex_24h: bool = False
    exclusion_cystoscopy_48h: bool = False
    exclusion_dre_1w: bool = False
    biopsy_3y: bool = False
    prostatectomy: bool = False
    cancer_history: Optional[List[str]] = None
    cancer_treatment: bool = False
    severe_organ_disease: bool = False
    alzheimer: bool = False
    other_studies: bool = False
    meds_5alpha_inhibitor: bool = False
    meds_estrogen: bool = False
    meds_progesterone: bool = False
    meds_androgen: bool = False
    meds_corticoids: bool = False
    meds_saw_palmetto: bool = False
    symptom_difficulty: bool = False
    symptom_frequency: bool = False
    symptom_urgency: bool = False
    symptom_incomplete: bool = False
    symptom_dribbling: bool = False
    symptom_bone_pain: bool = False
    symptom_hematuria: bool = False
    psa_value: Optional[str] = None
    is_psa_done: bool = False
    ultrasound_result: Optional[str] = None
    ultrasound_images: Optional[List[str]] = None
    is_ultrasound_done: bool = False
class SurveyCreate(SurveyBase):
    registration_id: int

class SurveyResponse(SurveyBase):
    id: int
    registration_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QueueUpdate(BaseModel):
    station: str
    current_number: int

class QueueResponse(BaseModel):
    station: str
    current_number: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

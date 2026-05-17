from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import PatientRegistration, SystemSettings, ScreeningSurvey
from ..schemas import RegistrationCreate, RegistrationSchema, SurveyCreate
from ..utils.email import send_registration_email
from ..websockets import manager
import asyncio

router = APIRouter(tags=["registration"])

def calculate_age(dob: datetime, endpoint_date: datetime = datetime(2026, 6, 1)):
    return endpoint_date.year - dob.year - ((endpoint_date.month, endpoint_date.day) < (dob.month, dob.day))

@router.get("/slots/stats")
async def get_slot_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    counts = db.query(PatientRegistration.appointment_slot, func.count(PatientRegistration.id)).filter(PatientRegistration.status != "HUY").group_by(PatientRegistration.appointment_slot).all()
    return {slot: count for slot, count in counts if slot}

@router.post("/registration", response_model=RegistrationSchema)
async def register_patient(patient: RegistrationCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Received registration for {patient.full_name}, CCCD: {patient.cccd}")
    try:
        # 1. Check system settings and dynamic slots
        settings = db.query(SystemSettings).first()
        if not settings or not settings.registration_active:
            raise HTTPException(status_code=400, detail="Chương trình tạm dừng nhận đăng ký.")
        
        # Calculate taken slots: only those NOT cancelled ('HUY')
        taken_slots = db.query(PatientRegistration).filter(PatientRegistration.status != "HUY").count()
        if taken_slots >= settings.registration_limit:
            raise HTTPException(status_code=400, detail="Chương trình đã đủ số lượng đăng ký.")

        # 2. Duplicate check (CCCD & Phone)
        existing_cccd = db.query(PatientRegistration).filter(PatientRegistration.cccd == patient.cccd).first()
        if existing_cccd:
            raise HTTPException(status_code=400, detail="Số CCCD này đã được đăng ký.")
        
        existing_phone = db.query(PatientRegistration).filter(PatientRegistration.phone == patient.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Số điện thoại này đã được đăng ký.")

        # 3. Logic Validate Age & Risk
        age = calculate_age(patient.dob)
        
        # Calculate effective family history for risk logic
        has_risk_history = patient.history_father or patient.history_brother or patient.family_history
        
        if age < 45:
            raise HTTPException(status_code=403, detail="Độ tuổi chưa phù hợp với chương trình (< 45 tuổi).")
        
        if 45 <= age <= 50 and not has_risk_history:
            raise HTTPException(status_code=403, detail="Thông tin chưa phù hợp (45-50 tuổi cần có yếu tố nguy cơ tiền sử gia đình).")

        # 4. Generate Registration Number (YYMMNNNN)
        now = datetime.now()
        prefix_int = int(now.strftime("%y%m0000"))
        from sqlalchemy import func
        max_num = db.query(func.max(PatientRegistration.registration_number)).filter(
            PatientRegistration.registration_number >= prefix_int,
            PatientRegistration.registration_number < prefix_int + 10000
        ).scalar()
        next_num = (max_num + 1) if max_num else (prefix_int + 1)

        # 5. Save to database
        patient_data = patient.dict()
        # Remove fields that we are setting explicitly to avoid "multiple values for argument" error
        patient_data.pop('family_history', None)
        
        db_patient = PatientRegistration(
            **patient_data,
            registration_number=next_num,
            family_history=has_risk_history, # Update the aggregate field
            age_at_endpoint=age,
            status="CHO_XAC_NHAN"
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        print(f"DEBUG: Registration successful for {patient.full_name}, ID: {db_patient.id}")
        
        asyncio.create_task(manager.broadcast({
            "type": "NEW_REGISTRATION",
            "patient_id": db_patient.id
        }))

        # 6. Send Registration Email (Background)
        if db_patient.email:
            send_registration_email(
                patient_email=db_patient.email,
                patient_name=db_patient.full_name,
                registration_number=db_patient.registration_number,
                slot=db_patient.appointment_slot
            )

        return db_patient

    except HTTPException as e:
        # Re-raise HTTP exceptions (like 400, 403) so FastAPI can handle them
        raise e
    except Exception as e:
        print(f"DEBUG: Error in registration: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")


@router.post("/screening/submit")
async def submit_screening(survey: SurveyCreate, db: Session = Depends(get_db)):
    # 1. Check if registration exists
    patient = db.query(PatientRegistration).filter(PatientRegistration.id == survey.registration_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin đăng ký.")

    # 2. Check if survey already exists
    existing = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == survey.registration_id).first()
    if existing:
        # Update existing survey if already submitted (to handle retries)
        for key, value in survey.dict().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
    else:
        # Create new survey
        db_survey = ScreeningSurvey(**survey.dict())
        db.add(db_survey)
        db.commit()
        
    # 3. Send Emails
    # We do not change patient.status here so they don't skip Reception/Screening workflow.
    
    asyncio.create_task(manager.broadcast({
        "type": "SURVEY_SUBMITTED",
        "patient_id": patient.id,
        "status": patient.status
    }))
    
    send_registration_email(
        patient_email=patient.email,
        patient_name=patient.full_name,
        registration_number=patient.registration_number,
        slot=patient.appointment_slot
    )

    return {"message": "Screening completed successfully"}

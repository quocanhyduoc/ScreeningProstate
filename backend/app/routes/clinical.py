from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas, auth
from ..websockets import manager
import datetime

router = APIRouter(prefix="/clinical", tags=["clinical"])

@router.get("/registrations", response_model=List[schemas.RegistrationSchema])
def get_clinical_registrations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    # Allowed roles for Clinical tasks: SUPERADMIN, CLINICAL
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = db.query(models.PatientRegistration)
    if status:
        status_list = status.split(',')
        query = query.filter(models.PatientRegistration.status.in_(status_list))
    
    return query.order_by(models.PatientRegistration.registration_number.asc()).all()

@router.get("/patient/{cccd}", response_model=schemas.RegistrationSchema)
def get_patient_by_cccd(
    cccd: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    patient = db.query(models.PatientRegistration).filter(models.PatientRegistration.cccd == cccd).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.patch("/status/{registration_id}")
async def update_patient_status(
    registration_id: int,
    update: schemas.StatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    patient = db.query(models.PatientRegistration).filter(models.PatientRegistration.id == registration_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    new_status = update.status
    
    # Logic: Nếu Reception tiếp nhận (DA_TIEP_NHAN) mà bệnh nhân ĐÃ CÓ khảo sát, thì bỏ qua Khám Sàng Lọc (chuyển thẳng sang CHO_XET_NGHIEM)
    if new_status == "DA_TIEP_NHAN":
        existing_survey = db.query(models.ScreeningSurvey).filter(models.ScreeningSurvey.registration_id == registration_id).first()
        if existing_survey:
            new_status = "CHO_XET_NGHIEM"
            
    patient.status = new_status
    db.commit()
    db.refresh(patient)
    background_tasks.add_task(manager.broadcast, {"type": "UPDATE_PATIENT", "patient_id": registration_id, "status": new_status})
    return {"message": "Status updated", "status": new_status}

@router.post("/survey", response_model=schemas.SurveyResponse)
async def create_survey(
    survey: schemas.SurveyCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(auth.get_current_user_optional)
):
    # Check if patient exists
    patient = db.query(models.PatientRegistration).filter(models.PatientRegistration.id == survey.registration_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Check if survey already exists
    existing = db.query(models.ScreeningSurvey).filter(models.ScreeningSurvey.registration_id == survey.registration_id).first()
    
    if existing:
        if not current_user:
            # Public user cannot overwrite an existing survey
            raise HTTPException(status_code=403, detail="Survey already submitted. Public updates are not allowed.")
        
        # Admin can update existing
        for key, value in survey.model_dump().items():
            setattr(existing, key, value)
            
        # Advancing status to CHO_XET_NGHIEM if admin saves the survey
        patient.status = "CHO_XET_NGHIEM"
        db.commit()
        background_tasks.add_task(manager.broadcast, {"type": "UPDATE_PATIENT", "patient_id": patient.id, "status": "CHO_XET_NGHIEM"})
        
        db.refresh(existing)
        return existing
    
    db_survey = models.ScreeningSurvey(**survey.model_dump())
    db.add(db_survey)
    
    # Auto-update patient status to next step
    patient.status = "CHO_XET_NGHIEM"
    
    db.commit()
    background_tasks.add_task(manager.broadcast, {"type": "UPDATE_PATIENT", "patient_id": patient.id, "status": "CHO_XET_NGHIEM"})
    db.refresh(db_survey)
    return db_survey

@router.get("/survey/{registration_id}", response_model=Optional[schemas.SurveyResponse])
def get_survey(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    survey = db.query(models.ScreeningSurvey).filter(models.ScreeningSurvey.registration_id == registration_id).first()
    return survey

@router.get("/queue", response_model=List[schemas.QueueResponse])
def get_queue_status(db: Session = Depends(get_db)):
    return db.query(models.QueueStatus).all()

@router.post("/queue/call", response_model=schemas.QueueResponse)
def call_next_number(
    update: schemas.QueueUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    q = db.query(models.QueueStatus).filter(models.QueueStatus.station == update.station).first()
    if not q:
        q = models.QueueStatus(station=update.station, current_number=update.current_number)
        db.add(q)
    else:
        q.current_number = update.current_number
        q.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(q)
    return q

@router.get("/stats")
def get_clinical_stats(
    db: Session = Depends(get_db)
):
    # Overall counts
    total_completed = db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "HOAN_THANH").count()
    total_in_progress = db.query(models.PatientRegistration).filter(
        models.PatientRegistration.status.in_([
            "DA_TIEP_NHAN", "CHO_XET_NGHIEM", "DA_XET_NGHIEM", "CHO_TU_VAN"
        ])
    ).count()
    total_waiting = db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "DA_XAC_NHAN").count()
    
    # Per station counts
    station_counts = {
        "TIEP_NHAN": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "DA_XAC_NHAN").count(),
        "KHAM_SL": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "DA_TIEP_NHAN").count(),
        "XET_NGHIEM": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "CHO_XET_NGHIEM").count(),
        "TU_VAN": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "CHO_TU_VAN").count()
    }
    
    return {
        "completed": total_completed,
        "in_progress": total_in_progress,
        "waiting": total_waiting,
        "station_counts": station_counts
    }

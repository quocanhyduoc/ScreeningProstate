from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas, auth
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
        query = query.filter(models.PatientRegistration.status == status)
    
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
def update_patient_status(
    registration_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    patient = db.query(models.PatientRegistration).filter(models.PatientRegistration.id == registration_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient.status = new_status
    db.commit()
    return {"message": "Status updated", "status": new_status}

@router.post("/survey", response_model=schemas.SurveyResponse)
def create_survey(
    survey: schemas.SurveyCreate,
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
        db.commit()
        db.refresh(existing)
        return existing
    
    db_survey = models.ScreeningSurvey(**survey.model_dump())
    db.add(db_survey)
    
    # Auto-update patient status to next step
    patient.status = "CHO_XET_NGHIEM"
    
    db.commit()
    db.refresh(db_survey)
    return db_survey

@router.get("/survey/{registration_id}", response_model=schemas.SurveyResponse)
def get_survey(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    survey = db.query(models.ScreeningSurvey).filter(models.ScreeningSurvey.registration_id == registration_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
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
            "DA_TIEP_NHAN", "CHO_XET_NGHIEM", "DA_LAY_MAU", "CHO_KET_QUA", "DANG_TU_VAN"
        ])
    ).count()
    total_waiting = db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "DA_XAC_NHAN").count()
    
    # Per station counts
    station_counts = {
        "TIEP_NHAN": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "DA_XAC_NHAN").count(),
        "TU_VAN_SL": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "DA_TIEP_NHAN").count(),
        "LAY_MAU": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "CHO_XET_NGHIEM").count(),
        "TRA_KQ": db.query(models.PatientRegistration).filter(models.PatientRegistration.status == "CHO_KET_QUA").count()
    }
    
    return {
        "completed": total_completed,
        "in_progress": total_in_progress,
        "waiting": total_waiting,
        "station_counts": station_counts
    }

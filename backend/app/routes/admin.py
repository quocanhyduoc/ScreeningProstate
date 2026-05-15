from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional
import pandas as pd
from io import BytesIO
import os
import uuid
from fastapi.responses import StreamingResponse
from ..database import get_db
from ..models import PatientRegistration, User, SystemSettings
from ..schemas import RegistrationSchema, SystemSettingsUpdate, UserSchema, UserCreate, UserUpdate, RegistrationUpdate
from ..auth import get_current_user, get_password_hash
from ..websockets import manager
import asyncio

router = APIRouter(prefix="/admin", tags=["admin"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or handle commands if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total = db.query(PatientRegistration).count()
    settings = db.query(SystemSettings).first()
    max_slots = settings.registration_limit if settings else 300
    
    pending = db.query(PatientRegistration).filter(PatientRegistration.status == "CHO_XAC_NHAN").count()
    confirmed = db.query(PatientRegistration).filter(PatientRegistration.status == "DA_XAC_NHAN").count()
    cancelled = db.query(PatientRegistration).filter(PatientRegistration.status == "HUY").count()
    
    taken_slots = db.query(PatientRegistration).filter(PatientRegistration.status != "HUY").count()
    available_slots = max(0, max_slots - taken_slots)

    status_counts = db.query(PatientRegistration.status, func.count(PatientRegistration.id)).group_by(PatientRegistration.status).all()
    
    return {
        "total_registrations": total,
        "pending_registrations": pending,
        "confirmed_registrations": confirmed,
        "cancelled_registrations": cancelled,
        "available_slots": available_slots,
        "max_slots": max_slots,
        "status_distribution": dict(status_counts)
    }

@router.get("/registrations", response_model=List[RegistrationSchema])
def get_registration_list(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(PatientRegistration).order_by(PatientRegistration.created_at.desc()).all()

@router.get("/survey/{registration_id}")
def get_survey_data(registration_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Chỉ Bác sĩ hoặc Admin mới được phép xem kết quả khảo sát.")
    
    from ..models import ScreeningSurvey
    survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == registration_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey

@router.patch("/registration/{patient_id}")
def update_registration_status(patient_id: int, status_update: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Chỉ bộ phận Lâm sàng hoặc Admin mới có quyền cập nhật.")
    
    patient = db.query(PatientRegistration).filter(PatientRegistration.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")
    
    if "status" in status_update:
        patient.status = status_update["status"]
    if "phone_verified" in status_update:
        patient.phone_verified = status_update["phone_verified"]
        
    db.commit()
    asyncio.create_task(manager.broadcast({"type": "UPDATE_PATIENT", "patient_id": patient_id, "status": patient.status}))
    return {"message": "Updated successfully"}

@router.get("/export")
def export_to_excel(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    is_restricted = current_user["role"] == "CLINICAL"
    
    patients = db.query(PatientRegistration).all()
    data = []
    from ..models import ScreeningSurvey
    for p in patients:
        survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
        
        # Handle cancer_history safely
        history_str = "Không"
        if survey and survey.cancer_history:
            if isinstance(survey.cancer_history, list):
                history_str = ", ".join(survey.cancer_history)
            else:
                history_str = str(survey.cancer_history)

        row = {
            "Mã đăng ký": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
            "Họ và Tên": p.full_name,
            "Số điện thoại": p.phone,
            "Email": p.email or "N/A",
            "Ngày sinh": p.dob.strftime("%d/%m/%Y") if p.dob else "N/A",
            "Địa chỉ": f"{p.address_detail}, {p.ward}, {p.district}, {p.province}",
            "Số CCCD": p.cccd,
            "Khung giờ hẹn": p.appointment_slot,
            "Suất ngoài dự kiến": "Có" if p.is_extra_slot else "Không",
            "Trạng thái": p.status,
            "Ngày đăng ký": p.created_at.strftime("%d/%m/%Y %H:%M") if p.created_at else "N/A",
        }
        
        # Add clinical data ONLY for SuperAdmin
        if not is_restricted:
            row.update({
                "BRCA Mutation": "Có" if survey and survey.brca_mutation else "Không",
                "Tuổi Cha chẩn đoán K": survey.father_age_diag if survey and survey.father_age_diag else "",
                "Tuổi Anh/Em chẩn đoán K": survey.brother_age_diag if survey and survey.brother_age_diag else "",
                "QH TD/Xuất tinh (24h)": "Có" if survey and survey.exclusion_sex_24h else "Không",
                "Nội soi/Thông tiểu (48h)": "Có" if survey and survey.exclusion_cystoscopy_48h else "Không",
                "Thăm trực tràng/Đạp xe (1w)": "Có" if survey and survey.exclusion_dre_1w else "Không",
                "Đang điều trị K": "Có" if survey and survey.cancer_treatment else "Không",
                "Đã cắt bỏ TTL": "Có" if survey and survey.prostatectomy else "Không",
                "Sinh thiết TTL (3y)": "Có" if survey and survey.biopsy_3y else "Không",
                "Tiền sử K khác": history_str,
                "Triệu chứng đường tiểu": p.symptoms or ""
            })
        
        data.append(row)
    
    df = pd.DataFrame(data)
    output = BytesIO()
    try:
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Danh sach dang ky')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo file Excel: {str(e)}")
    
    output.seek(0)
    headers = {
        'Content-Disposition': 'attachment; filename="Danh_sach_tam_soat_UTTTL.xlsx"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

# --- PATIENT FULL MANAGEMENT (Admin Only) ---
@router.put("/registration/{patient_id}")
def edit_patient_registration(patient_id: int, update_data: RegistrationUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền sửa đổi thông tin bệnh nhân.")
    
    patient = db.query(PatientRegistration).filter(PatientRegistration.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")
    
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(patient, key, value)
    
    db.commit()
    asyncio.create_task(manager.broadcast({"type": "UPDATE_PATIENT", "patient_id": patient_id, "action": "EDIT"}))
    return {"message": "Cập nhật thông tin thành công"}

@router.post("/patient/{patient_id}/ultrasound")
async def add_ultrasound_result(
    patient_id: int, 
    result: str = Form(...), 
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from ..models import PatientRegistration, ScreeningSurvey
    patient = db.query(PatientRegistration).filter(PatientRegistration.id == patient_id).first()
    if not patient: raise HTTPException(status_code=404, detail="Not found")
    survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == patient_id).first()
    if not survey: raise HTTPException(status_code=404, detail="Survey not found")

    image_paths = []
    if images:
        os.makedirs("uploads/ultrasound", exist_ok=True)
        for img in images:
            if img.filename:
                ext = img.filename.split(".")[-1]
                filename = f"reg_{patient_id}_{uuid.uuid4().hex}.{ext}"
                path = f"uploads/ultrasound/{filename}"
                with open(path, "wb") as f:
                    f.write(await img.read())
                image_paths.append(path)
    
    survey.ultrasound_result = result
    if image_paths:
        survey.ultrasound_images = image_paths
    survey.is_ultrasound_done = True
    patient.status = "DA_SIEU_AM"
    db.commit()
    
    asyncio.create_task(manager.broadcast({"type": "UPDATE_PATIENT", "patient_id": patient_id, "status": "DA_SIEU_AM"}))
    return {"message": "Success"}

@router.post("/patient/{patient_id}/psa")
async def add_psa_result(
    patient_id: int,
    psa_value: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    from ..models import PatientRegistration, ScreeningSurvey
    patient = db.query(PatientRegistration).filter(PatientRegistration.id == patient_id).first()
    survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == patient_id).first()
    
    if not patient or not survey:
        raise HTTPException(status_code=404, detail="Not found")
        
    survey.psa_value = psa_value
    survey.is_psa_done = True
    patient.status = "DA_CO_KET_QUA_MAU"
    db.commit()
    
    asyncio.create_task(manager.broadcast({"type": "UPDATE_PATIENT", "patient_id": patient_id, "status": "DA_CO_KET_QUA_MAU", "psa_value": psa_value}))
    return {"message": "Success"}

@router.get("/scan/{qr_code}")
def scan_patient(qr_code: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from ..models import PatientRegistration
    patient = db.query(PatientRegistration).filter(PatientRegistration.cccd == qr_code).first()
    if not patient and qr_code.isdigit():
        patient = db.query(PatientRegistration).filter(PatientRegistration.registration_number == int(qr_code)).first()
    if not patient:
        patient = db.query(PatientRegistration).filter(PatientRegistration.phone == qr_code).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bệnh nhân")
    return patient

@router.delete("/registration/{patient_id}")
def delete_patient_registration(patient_id: int, payload: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền xóa dữ liệu.")
    
    password = payload.get("password")
    if not password:
        raise HTTPException(status_code=400, detail="Vui lòng nhập mật khẩu xác nhận.")
        
    from ..auth import verify_password
    user = db.query(User).filter(User.username == current_user["username"]).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Mật khẩu xác nhận không chính xác.")

    patient = db.query(PatientRegistration).filter(PatientRegistration.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")
    
    # Also delete associated survey
    from ..models import ScreeningSurvey
    db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == patient_id).delete()
    
    db.delete(patient)
    db.commit()
    return {"message": "Đã xóa bản ghi thành công"}

# --- USER MANAGEMENT (Admin Only) ---
@router.get("/users", response_model=List[UserSchema])
def list_users(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(User).all()

@router.post("/users", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        role=user.role,
        permissions=user.permissions
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.patch("/users/{user_id}", response_model=UserSchema)
def update_user(user_id: int, update: UserUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.username: user.username = update.username
    if update.role: user.role = update.role
    if update.password: user.hashed_password = get_password_hash(update.password)
    if update.permissions is not None: user.permissions = update.permissions
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.username == current_user["username"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.patch("/settings")
def update_settings(update: SystemSettingsUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Only SuperAdmin can change system settings")
    
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
    
    if update.registration_active is not None:
        settings.registration_active = update.registration_active
    if update.registration_limit is not None:
        settings.registration_limit = update.registration_limit
        
    db.commit()
    return {"message": "Settings updated"}

@router.post("/reset-all")
def reset_all_data(payload: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Chỉ SuperAdmin mới có quyền xóa toàn bộ dữ liệu.")
    
    password = payload.get("password")
    if not password:
        raise HTTPException(status_code=400, detail="Vui lòng nhập mật khẩu xác nhận.")
        
    # Verify password again for safety
    from ..auth import verify_password
    user = db.query(User).filter(User.username == current_user["username"]).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Mật khẩu xác nhận không chính xác.")

    # Perform reset
    from ..models import ScreeningSurvey, PatientRegistration
    db.query(ScreeningSurvey).delete()
    db.query(PatientRegistration).delete()
    
    # Reset sequence if PostgreSQL
    db.execute(text("ALTER SEQUENCE patient_registrations_id_seq RESTART WITH 1;"))
    db.execute(text("ALTER SEQUENCE screening_surveys_id_seq RESTART WITH 1;"))
    # Also reset the registration_number column counter if needed, but since we deleted all, it's fine if we handle it in code
    
    db.commit()
    return {"message": "Toàn bộ dữ liệu đã được xóa sạch."}

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, File, UploadFile, Form, BackgroundTasks
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
async def update_registration_status(patient_id: int, status_update: RegistrationUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Chỉ bộ phận Lâm sàng hoặc Admin mới có quyền cập nhật.")
    
    patient = db.query(PatientRegistration).filter(PatientRegistration.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")
    
    if status_update.status is not None:
        patient.status = status_update.status
    if status_update.phone_verified is not None:
        patient.phone_verified = status_update.phone_verified
        
    try:
        db.commit()
        db.refresh(patient)
        background_tasks.add_task(manager.broadcast, {"type": "UPDATE_PATIENT", "patient_id": patient_id, "status": patient.status})
        return {"message": "Updated successfully"}
    except Exception as e:
        print(f"DEBUG: ERROR in update_registration_status: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
def export_to_excel(
    section: Optional[str] = "patients",
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["SUPERADMIN", "CLINICAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    patients = db.query(PatientRegistration).all()
    data = []
    from ..models import ScreeningSurvey
    
    if section == "overall":
        filename = "Bao_cao_tong_the_toan_he_thong.xlsx"
        
        # 1. Sheet: Tài khoản Nhân viên
        users = db.query(User).all()
        users_data = []
        for idx, u in enumerate(users, 1):
            users_data.append({
                "STT": idx,
                "Tên tài khoản": u.username,
                "Vai trò": u.role,
                "Danh sách quyền": ", ".join(u.permissions) if u.permissions and isinstance(u.permissions, list) else "Không có"
            })
            
        # 2. Sheet: Danh sách Đăng ký
        status_map = {
            "CHO_XAC_NHAN": "Chờ xác nhận",
            "DA_XAC_NHAN": "Đã chốt lịch hẹn",
            "DA_TIEP_NHAN": "Đã tiếp nhận (Check-in)",
            "DA_XET_NGHIEM": "Đã xét nghiệm (Lấy mẫu/Siêu âm)",
            "CHO_TU_VAN": "Chờ tư vấn bác sĩ",
            "HOAN_THANH": "Hoàn thành",
            "DA_HUY": "Đã hủy"
        }
        patients_data = []
        for idx, p in enumerate(patients, 1):
            patients_data.append({
                "STT": idx,
                "Mã số (STT)": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
                "Họ và tên bệnh nhân": p.full_name,
                "Số CCCD": p.cccd,
                "Số điện thoại": p.phone,
                "Ngày tháng năm sinh": p.dob.strftime("%d/%m/%Y") if p.dob else "N/A",
                "Địa chỉ": f"{p.address_detail}, {p.ward}, {p.district}, {p.province}",
                "Khung giờ hẹn": p.appointment_slot or "N/A",
                "Là suất phụ trội?": "Có" if p.is_extra_slot else "Không",
                "Ngày giờ đăng ký": p.created_at.strftime("%d/%m/%Y %H:%M") if p.created_at else "N/A",
                "Trạng thái hiện tại": status_map.get(p.status, p.status)
            })
            
        # 3. Sheet: Khảo sát Sàng lọc
        screening_data = []
        for idx, p in enumerate(patients, 1):
            survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
            if not survey:
                continue
                
            history_str = "Không"
            if survey.cancer_history:
                if isinstance(survey.cancer_history, list):
                    history_str = ", ".join(survey.cancer_history)
                else:
                    history_str = str(survey.cancer_history)
                    
            symptoms_list = []
            if survey.symptom_incomplete: symptoms_list.append("Tiểu không hết")
            if survey.symptom_frequency: symptoms_list.append("Tiểu nhiều lần")
            if survey.symptom_difficulty: symptoms_list.append("Tiểu khó")
            if survey.symptom_urgency: symptoms_list.append("Tiểu gấp")
            if survey.symptom_dribbling: symptoms_list.append("Tiểu ngắt quãng")
            if survey.symptom_bone_pain: symptoms_list.append("Đau xương")
            if survey.symptom_hematuria: symptoms_list.append("Tiểu ra máu")
            
            screening_data.append({
                "STT": idx,
                "Mã số": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
                "Họ và tên": p.full_name,
                "Đột biến BRCA": "Có" if survey.brca_mutation else "Không",
                "Triệu chứng đường tiểu": ", ".join(symptoms_list) if symptoms_list else "Không có",
                "Tuổi Cha chẩn đoán K": survey.father_age_diag if survey.father_age_diag else "",
                "Tuổi Anh/Em chẩn đoán K": survey.brother_age_diag if survey.brother_age_diag else "",
                "Tiền sử K khác": history_str,
                "Đang điều trị K": "Có" if survey.cancer_treatment else "Không",
                "Bệnh tạng nặng": "Có" if survey.severe_organ_disease else "Không",
                "Alzheimer": "Có" if survey.alzheimer else "Không",
                "QH TD/Xuất tinh (24h)": "Có" if survey.exclusion_sex_24h else "Không",
                "Nội soi/Thông tiểu (48h)": "Có" if survey.exclusion_cystoscopy_48h else "Không",
                "Thăm trực tràng/Đạp xe (1w)": "Có" if survey.exclusion_dre_1w else "Không",
                "Tiền sử sinh thiết TTL (3y)": "Có" if survey.biopsy_3y else "Không",
                "Đã cắt bỏ TTL": "Có" if survey.prostatectomy else "Không",
                "Sử dụng thuốc 5ARI": "Có" if survey.meds_5alpha_inhibitor else "Không",
                "Sử dụng Saw Palmetto": "Có" if survey.meds_saw_palmetto else "Không",
                "Sử dụng Corticoids": "Có" if survey.meds_corticoids else "Không"
            })
            
        # 4. Sheet: Xét nghiệm & Siêu âm
        lab_data = []
        for idx, p in enumerate(patients, 1):
            survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
            if not survey:
                continue
            lab_data.append({
                "STT": idx,
                "Mã số": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
                "Họ và tên": p.full_name,
                "Số CCCD": p.cccd,
                "Đã làm xét nghiệm?": "Rồi" if p.status in ["DA_XET_NGHIEM", "HOAN_THANH"] or (survey.is_psa_done or survey.is_ultrasound_done) else "Chưa",
                "Chỉ số PSA toàn phần (ng/ml)": survey.psa_value if survey.psa_value else "Chưa có",
                "Đã xét nghiệm PSA?": "Đã có" if survey.is_psa_done else "Chưa",
                "Kết quả siêu âm ổ bụng": survey.ultrasound_result if survey.ultrasound_result else "Chưa có",
                "Đã siêu âm?": "Đã có" if survey.is_ultrasound_done else "Chưa",
                "Ngày làm xét nghiệm": survey.created_at.strftime("%d/%m/%Y %H:%M") if survey.created_at else "N/A"
            })
            
        # 5. Sheet: Tư vấn & Trả kết quả
        consult_data = []
        for idx, p in enumerate(patients, 1):
            survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
            consult_data.append({
                "STT": idx,
                "Mã số": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
                "Họ và tên": p.full_name,
                "Số CCCD": p.cccd,
                "Số điện thoại": p.phone,
                "Chỉ số PSA (ng/ml)": survey.psa_value if (survey and survey.psa_value) else "Chưa có",
                "Kết quả siêu âm": survey.ultrasound_result if (survey and survey.ultrasound_result) else "Chưa có",
                "Trạng thái hoàn thành": "Hoàn thành" if p.status == "HOAN_THANH" else "Chưa hoàn thành"
            })
            
        # Write to Multi-sheet Excel
        df_users = pd.DataFrame(users_data) if users_data else pd.DataFrame(columns=["STT", "Tên tài khoản", "Vai trò", "Danh sách quyền"])
        df_patients = pd.DataFrame(patients_data) if patients_data else pd.DataFrame(columns=["STT", "Mã số (STT)", "Họ và tên bệnh nhân"])
        df_screening = pd.DataFrame(screening_data) if screening_data else pd.DataFrame(columns=["STT", "Mã số", "Họ và tên"])
        df_lab = pd.DataFrame(lab_data) if lab_data else pd.DataFrame(columns=["STT", "Mã số", "Họ và tên"])
        df_consult = pd.DataFrame(consult_data) if consult_data else pd.DataFrame(columns=["STT", "Mã số", "Họ và tên"])
        
        output = BytesIO()
        try:
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df_users.to_excel(writer, index=False, sheet_name="Tài khoản Nhân viên")
                df_patients.to_excel(writer, index=False, sheet_name="Danh sách Đăng ký")
                df_screening.to_excel(writer, index=False, sheet_name="Khảo sát Sàng lọc")
                df_lab.to_excel(writer, index=False, sheet_name="Xét nghiệm & Siêu âm")
                df_consult.to_excel(writer, index=False, sheet_name="Tư vấn & Trả kết quả")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi tạo file Excel tổng hợp: {str(e)}")
            
        output.seek(0)
        
        import urllib.parse
        safe_filename = urllib.parse.quote(filename)
        headers = {
            'Content-Disposition': f"attachment; filename*=UTF-8''{safe_filename}"
        }
        return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    elif section == "clinical_screening":
        # Phân hệ Lâm sàng: Khám sàng lọc & Khảo sát
        sheet_title = "Sang loc lam sang"
        filename = "Bao_cao_sang_loc_lam_sang.xlsx"
        
        for idx, p in enumerate(patients, 1):
            survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
            
            history_str = "Không"
            if survey and survey.cancer_history:
                if isinstance(survey.cancer_history, list):
                    history_str = ", ".join(survey.cancer_history)
                else:
                    history_str = str(survey.cancer_history)
            
            row = {
                "STT": idx,
                "Mã đăng ký": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
                "Họ và Tên": p.full_name,
                "Số CCCD": p.cccd,
                "Số điện thoại": p.phone,
                "Ngày sinh": p.dob.strftime("%d/%m/%Y") if p.dob else "N/A",
                "Địa chỉ": f"{p.address_detail}, {p.ward}, {p.district}, {p.province}",
                "Trạng thái sàng lọc": "Đã làm" if survey else "Chưa làm",
                "Đột biến BRCA": "Có" if survey and survey.brca_mutation else "Không",
                "Tuổi Cha chẩn đoán K": survey.father_age_diag if survey and survey.father_age_diag else "",
                "Tuổi Anh/Em chẩn đoán K": survey.brother_age_diag if survey and survey.brother_age_diag else "",
                "QH TD/Xuất tinh (24h)": "Có" if survey and survey.exclusion_sex_24h else "Không",
                "Nội soi/Thông tiểu (48h)": "Có" if survey and survey.exclusion_cystoscopy_48h else "Không",
                "Thăm trực tràng/Đạp xe (1w)": "Có" if survey and survey.exclusion_dre_1w else "Không",
                "Tiền sử sinh thiết TTL (3y)": "Có" if survey and survey.biopsy_3y else "Không",
                "Đã cắt bỏ TTL": "Có" if survey and survey.prostatectomy else "Không",
                "Tiền sử K khác": history_str,
                "Đang điều trị K": "Có" if survey and survey.cancer_treatment else "Không",
                "Bệnh tạng nặng": "Có" if survey and survey.severe_organ_disease else "Không",
                "Alzheimer": "Có" if survey and survey.alzheimer else "Không",
                "Triệu chứng đường tiểu": p.symptoms or "Không"
            }
            data.append(row)
            
    elif section == "clinical_lab":
        # Phân hệ Lâm sàng: Xét nghiệm PSA & Siêu âm
        sheet_title = "Xet nghiem & Sieu am"
        filename = "Ket_qua_xet_nghiem_va_sieu_am.xlsx"
        
        for idx, p in enumerate(patients, 1):
            survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
            
            is_lab_done = "Rồi" if p.status in ["DA_XET_NGHIEM", "HOAN_THANH"] or (survey and (survey.is_psa_done or survey.is_ultrasound_done)) else "Chưa"
            psa_status = "Đã có" if survey and survey.is_psa_done else "Chưa"
            us_status = "Đã có" if survey and survey.is_ultrasound_done else "Chưa"
            
            row = {
                "STT": idx,
                "Mã đăng ký": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
                "Họ và Tên": p.full_name,
                "Số CCCD": p.cccd,
                "Số điện thoại": p.phone,
                "Ngày sinh": p.dob.strftime("%d/%m/%Y") if p.dob else "N/A",
                "Đã làm xét nghiệm?": is_lab_done,
                "Chỉ số PSA (ng/ml)": survey.psa_value if survey and survey.psa_value else "Chưa có",
                "Kết quả siêu âm": survey.ultrasound_result if survey and survey.ultrasound_result else "Chưa có",
                "Trạng thái PSA": psa_status,
                "Trạng thái Siêu âm": us_status,
                "Ngày làm xét nghiệm": survey.created_at.strftime("%d/%m/%Y %H:%M") if (survey and survey.created_at) else "N/A"
            }
            data.append(row)
            
    elif section == "clinical_consult":
        # Phân hệ Lâm sàng: Tư vấn chuyên sâu & Trả KQ
        sheet_title = "Tu van & Tra KQ"
        filename = "Danh_sach_tu_van_tra_ket_qua.xlsx"
        
        for idx, p in enumerate(patients, 1):
            survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
            
            row = {
                "STT": idx,
                "Mã đăng ký": f"#{p.registration_number:03d}" if p.registration_number else "N/A",
                "Họ và Tên": p.full_name,
                "Số CCCD": p.cccd,
                "Số điện thoại": p.phone,
                "Ngày sinh": p.dob.strftime("%d/%m/%Y") if p.dob else "N/A",
                "Địa chỉ": f"{p.address_detail}, {p.ward}, {p.district}, {p.province}",
                "Chỉ số PSA (ng/ml)": survey.psa_value if survey and survey.psa_value else "Chưa có",
                "Kết quả siêu âm": survey.ultrasound_result if survey and survey.ultrasound_result else "Chưa có",
                "Trạng thái tiến trình": "Hoàn thành" if p.status == "HOAN_THANH" else "Chưa hoàn thành"
            }
            data.append(row)
            
    else:
        # Mặc định: DS Bệnh nhân đăng ký tổng quát
        sheet_title = "Danh sach dang ky"
        filename = "Danh_sach_benh_nhan_dang_ky.xlsx"
        
        for idx, p in enumerate(patients, 1):
            survey = db.query(ScreeningSurvey).filter(ScreeningSurvey.registration_id == p.id).first()
            
            # 1. Xác nhận / Đặt lịch: Chưa chốt/Chốt rồi/huỷ
            if p.status == "DA_HUY":
                confirm_status = "Hủy"
            elif p.status == "CHO_XAC_NHAN":
                confirm_status = "Chưa chốt"
            else:
                confirm_status = "Chốt rồi"
                
            # 2. Làm sàng lọc rồi hay chưa?
            has_survey = "Rồi" if survey is not None else "Chưa"
            
            # 3. Làm xét nghiệm rồi hay chưa?
            has_test = "Rồi" if survey and (survey.is_psa_done or survey.is_ultrasound_done or p.status in ["DA_XET_NGHIEM", "HOAN_THANH"]) else "Chưa"
            
            # 4. Hoàn thành hay chưa?
            is_completed = "Rồi" if p.status == "HOAN_THANH" else "Chưa"
            
            row = {
                "STT": idx,
                "Mã CCCD": p.cccd,
                "Họ và tên BN": p.full_name,
                "Ngày tháng năm sinh": p.dob.strftime("%d/%m/%Y") if p.dob else "N/A",
                "SĐT": p.phone,
                "Địa chỉ": f"{p.address_detail}, {p.ward}, {p.district}, {p.province}",
                "Khung giờ hẹn ĐK": p.appointment_slot or "N/A",
                "Ngày giờ Đăng ký": p.created_at.strftime("%d/%m/%Y %H:%M") if p.created_at else "N/A",
                "Trạng thái đặt lịch": confirm_status,
                "Làm sàng lọc rồi hay chưa?": has_survey,
                "Làm xét nghiệm rồi hay chưa?": has_test,
                "Hoàn thành hay chưa?": is_completed
            }
            data.append(row)
            
    df = pd.DataFrame(data)
    output = BytesIO()
    try:
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name=sheet_title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo file Excel: {str(e)}")
        
    output.seek(0)
    
    import urllib.parse
    safe_filename = urllib.parse.quote(filename)
    headers = {
        'Content-Disposition': f"attachment; filename*=UTF-8''{safe_filename}"
    }
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

# --- PATIENT FULL MANAGEMENT (Admin Only) ---
@router.put("/registration/{patient_id}")
async def edit_patient_registration(patient_id: int, update_data: RegistrationUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "SUPERADMIN":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền sửa đổi thông tin bệnh nhân.")
    
    patient = db.query(PatientRegistration).filter(PatientRegistration.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")
    
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(patient, key, value)
    
    db.commit()
    await manager.broadcast({"type": "UPDATE_PATIENT", "patient_id": patient_id, "action": "EDIT"})
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
    patient.status = "DA_XET_NGHIEM"
    db.commit()
    
    await manager.broadcast({"type": "UPDATE_PATIENT", "patient_id": patient_id, "status": "DA_XET_NGHIEM"})
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
    patient.status = "CHO_TU_VAN"
    db.commit()
    
    await manager.broadcast({"type": "UPDATE_PATIENT", "patient_id": patient_id, "status": "CHO_TU_VAN", "psa_value": psa_value})
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
async def delete_patient_registration(patient_id: int, payload: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
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
async def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
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
async def update_user(user_id: int, update: UserUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
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
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
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
async def update_settings(update: SystemSettingsUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
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
async def reset_all_data(payload: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
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

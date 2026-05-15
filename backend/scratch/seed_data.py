
import sys
import os
import datetime
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import PatientRegistration, User
from app.auth import get_password_hash

def seed():
    print("🌱 Đang gieo dữ liệu mẫu cho hệ thống...")
    db = SessionLocal()
    try:
        # 1. Kiểm tra tài khoản admin (Đảm bảo đã có)
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                hashed_password=get_password_hash("admin@2026"),
                role="SUPERADMIN"
            )
            db.add(admin)
            print("✅ Đã tạo tài khoản admin/admin@2026")

        # 2. Tạo dữ liệu bệnh nhân mẫu
        patients = [
            {
                "full_name": "Nguyễn Văn A",
                "dob": datetime.datetime(1970, 5, 20),
                "cccd": "046070001234",
                "phone": "0905123456",
                "district": "TP Huế",
                "ward": "Phường Vĩnh Ninh",
                "address_detail": "123 Lê Lợi",
                "appointment_slot": "07:30 - 08:30 (15/05)",
                "registration_number": 1,
                "status": "DA_XAC_NHAN" # Đang chờ tiếp nhận
            },
            {
                "full_name": "Trần Văn B",
                "dob": datetime.datetime(1965, 10, 15),
                "cccd": "046065005678",
                "phone": "0914987654",
                "district": "Huyện Phú Vang",
                "ward": "Thị trấn Thuận An",
                "address_detail": "45 Tùng Thiện Vương",
                "appointment_slot": "08:30 - 09:30 (15/05)",
                "registration_number": 2,
                "status": "DA_TIEP_NHAN" # Đang chờ khảo sát
            },
            {
                "full_name": "Lê Công C",
                "dob": datetime.datetime(1958, 2, 28),
                "cccd": "046058009999",
                "phone": "0983111222",
                "district": "Thị xã Hương Thủy",
                "ward": "Phường Phú Bài",
                "address_detail": "789 Nguyễn Tất Thành",
                "appointment_slot": "09:30 - 10:30 (15/05)",
                "registration_number": 3,
                "status": "CHO_XET_NGHIEM" # Đang chờ lấy máu
            }
        ]

        for p_data in patients:
            existing = db.query(PatientRegistration).filter(PatientRegistration.cccd == p_data['cccd']).first()
            if not existing:
                p = PatientRegistration(**p_data, created_at=datetime.datetime.utcnow())
                db.add(p)
                print(f"✅ Đã thêm bệnh nhân: {p_data['full_name']}")

        db.commit()
        print("\n✨ HOÀN TẤT! Dữ liệu mẫu đã sẵn sàng.")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()

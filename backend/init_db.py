import sys
import os

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal
from app.models import Base, User, SystemSettings
from app.auth import get_password_hash

def init():
    print("🚀 Đang khởi tạo cơ sở dữ liệu cho Hệ thống Tầm soát UTTTL...")
    
    # 1. Tạo các bản (Xóa cũ nếu có để đảm bảo schema mới nhất)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Đã khởi tạo lại các bảng thành công.")

    db = SessionLocal()
    try:
        # 2. Tạo tài khoản SuperAdmin mặc định
        admin_user = db.query(User).filter(User.username == "admin_clinical").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                hashed_password=get_password_hash("admin@2026"),
                role="SUPERADMIN",
                permissions=["users", "settings", "reports", "calendar", "clinical_reception", "clinical_screening", "clinical_lab", "clinical_consult"]
            )
            db.add(admin_user)
            print("✅ Đã tạo tài khoản admin mặc định: admin_clinical / admin@2026")
        
    

        # 4. Khởi tạo System Settings
        settings = db.query(SystemSettings).first()
        if not settings:
            settings = SystemSettings(
                registration_active=True,
                registration_limit=300
            )
            db.add(settings)
            print("✅ Đã cấu hình hệ thống: Giới hạn 300 suất.")

        db.commit()
        print("\n✨ HOÀN TẤT! Hệ thống đã sẵn sàng vận hành.")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init()

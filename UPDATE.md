# 📋 Tổng Quan Hệ Thống (System Overview)

| Thành phần | Công nghệ / Đặc điểm | Vai trò & Chức năng |
| :--- | :--- | :--- |
| **Frontend** | Next.js (Pages Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React | Giao diện người dùng (Patient Portal), Dashboard quản trị và giao diện lâm sàng. |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic, JWT Authentication | Cung cấp RESTful API, xử lý logic nghiệp vụ, quản lý hàng đợi và xác thực người dùng. |
| **Database** | SQLite (mặc định), SQLAlchemy ORM | Lưu trữ thông tin bệnh nhân, dữ liệu khảo sát lâm sàng và cấu hình hệ thống. |
| **Xác thực** | JWT (JSON Web Token) | Phân quyền người dùng (RBAC): `SUPERADMIN`, `CLINICAL`, `CSKH`. |
| **Triển khai** | Docker, Docker Compose | Đóng gói toàn bộ hệ thống để triển khai nhất quán trên VPS/Server. |
| **Tính năng chính** | 6-Step Funnel, QR Digital Badge, Real-time Queue, Excel Export | Tự động hóa quy trình tầm soát từ đăng ký online đến khám onsite. |

---

# 📂 Chi Tiết Từng Phần (Detailed Components)

## 1. Frontend Architecture (Next.js)

Hệ thống frontend được xây dựng theo hướng **Component-driven**, tập trung vào trải nghiệm người dùng cao cấp (Premium UI/UX) và khả năng tương tác mượt mà.

*   **Quy trình đăng ký (Patient Funnel):** Nằm tại `src/pages/index.tsx`, gồm 6 bước:
    1.  **Thông tin cá nhân:** Thu thập họ tên, DOB, CCCD, SĐT, Email và địa chỉ (dữ liệu hành chính Việt Nam).
    2.  **Thời gian khám:** Chọn khung giờ từ `TIME_SLOTS`, hỗ trợ cơ chế "Extra Slot" khi hết suất chính thức.
    3.  **Tiền sử bệnh:** Sàng lọc tiền sử gia đình (Cha/Anh em bị K) và triệu chứng cơ bản.
    4.  **Xác nhận:** Kiểm tra lại dữ liệu và đồng ý điều khoản chia sẻ thông tin.
    5.  **Digital Badge:** Tạo mã QR duy nhất cho bệnh nhân, cho phép tải về dạng ảnh (sử dụng `html-to-image`).
    6.  **Khảo sát lâm sàng:** Tích hợp sâu các câu hỏi chuyên môn y khoa sau khi đăng ký thành công.
*   **Hệ thống Dashboard:**
    *   `admin/`: Theo dõi số liệu thống kê tổng thể, quản lý danh sách, xuất Excel và cấu hình hệ thống.
    *   `clinical/`: Dành cho bác sĩ tra cứu bệnh nhân nhanh bằng QR, nhập kết quả siêu âm, chỉ số PSA và quản lý hàng đợi gọi số.
*   **Giao diện hiển thị (Display):** `display.tsx` cập nhật trạng thái hàng đợi thời gian thực qua WebSocket.

## 2. Backend Architecture (FastAPI)

Backend được tổ chức theo cấu trúc module hóa, đảm bảo tính mở rộng và bảo mật.

*   **Models (`app/models.py`):**
    *   `PatientRegistration`: Thông tin cốt lõi, trạng thái (`CHO_XAC_NHAN`, `DA_TIEP_NHAN`, `HOAN_THANH`).
    *   `ScreeningSurvey`: Dữ liệu y khoa chi tiết (Biến dị BRCA, loại thuốc đang dùng, kết quả xét nghiệm).
    *   `User`: Quản lý tài khoản cán bộ y tế và quyền hạn.
    *   `QueueStatus`: Lưu trữ số thứ tự hiện tại của từng trạm (Tiếp nhận, Lấy mẫu, Siêu âm...).
*   **Routes (`app/routes/`):**
    *   `registration.py`: Tiếp nhận đăng ký mới, kiểm tra thống kê suất khám.
    *   `admin.py`: Xử lý các tác vụ quản trị cao cấp, xuất báo cáo Excel, reset dữ liệu.
    *   `clinical.py`: Các API phục vụ trực tiếp tại bàn khám (Nhập khảo sát, gọi số hàng đợi).
    *   `auth.py`: Đăng nhập và cấp phát Token.

## 3. Quy Trình Dữ Liệu (Workflow)

1.  **Đăng ký:** Bệnh nhân đăng ký qua funnel -> Dữ liệu lưu vào `patient_registrations`.
2.  **Check-in:** Tại hiện trường, nhân viên quét QR (CCCD hoặc mã số) -> Backend trả về thông tin bệnh nhân qua endpoint `/admin/scan/{qr_code}`.
3.  **Khám lâm sàng:** Bác sĩ điền khảo sát -> Lưu vào `screening_surveys` và tự động cập nhật trạng thái bệnh nhân.
4.  **Kết quả:** Kết quả PSA và siêu âm được cập nhật -> Hệ thống chuyển trạng thái về `HOAN_THANH`.

## 4. Environment & Deployment

*   **Biến môi trường:** Được quản lý qua file `.env` (Backend) và `.env.local` (Frontend). Quan trọng nhất là `NEXT_PUBLIC_API_URL`.
*   **Dockerization:**
    *   `docker-compose.yml`: Điều phối Container Frontend (Port 3000) và Backend (Port 8000).
    *   `uploads/`: Thư mục lưu trữ ảnh siêu âm và dữ liệu tĩnh.

---

> [!TIP]
> **Hướng dẫn cho AI Agent tiếp theo:** 
> - Nếu muốn tái cấu trúc Frontend: Tập trung vào việc tách các bước trong `index.tsx` thành các Component riêng lẻ để dễ bảo trì.
> - Nếu muốn nâng cấp Backend: Có thể chuyển từ SQLite sang PostgreSQL bằng cách thay đổi `DATABASE_URL` trong file `.env` mà không cần sửa code logic nhờ SQLAlchemy.
> - Chú ý logic tính toán độ tuổi và tiền sử gia đình tại hàm `isEligible` trong frontend để đảm bảo sàng lọc đúng đối tượng.

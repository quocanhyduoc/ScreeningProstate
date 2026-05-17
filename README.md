# Hệ thống Tầm soát Ung thư Tuyến tiền liệt - BV Trung ương Huế

Ứng dụng quản lý chương trình tầm soát miễn phí, tích hợp đăng ký QR Code và Dashboard quản trị phân quyền.

## Cài đặt Backend (FastAPI)

1. Cài đặt Python 3.9+
2. Di chuyển vào thư mục backend: `cd backend`
3. Tạo môi trường ảo: `python -m venv venv` và kích hoạt (`source venv/bin/activate`)
4. Cài đặt thư viện: `pip install -r requirements.txt`
   - *Lưu ý: Các thư viện chính: fastapi, uvicorn, sqlalchemy, psycopg2-binary, pandas, openpyxl, python-jose, passlib*
5. Tạo file `.env` từ `.env.example` và cấu hình Database.
6. Chạy server: `uvicorn app.main:app --reload`

## Cài đặt Frontend (Next.js)

1. Cài đặt Node.js 18+
2. Di chuyển vào thư mục frontend: `cd frontend`
3. Cài đặt dependencies: `npm install`
4. Tạo file `.env.local` từ `.env.local.example`.
5. Chạy dev server: `npm run dev`

## Tài khoản mặc định (Database Initialization)
Hệ thống tự động khởi tạo các thiết lập ban đầu. Để đăng nhập admin, bạn cần tạo User trong Database (PostgreSQL) với các role:
- `SUPERADMIN`: Toàn quyền.
- `UROLOGY`: Xem thống kê, duyệt danh sách, xuất Excel.
- `CSKH`: Gọi điện, cập nhật trạng thái (Telesale).

## Logic Tính Tuổi
- Chốt ngày: **01/06/2026**
- < 45 tuổi: Từ chối.
- 45 - 50 tuổi & Không có yếu tố nguy cơ: Từ chối.
- > 50 tuổi hoặc (45-50 tuổi & Có yếu tố nguy cơ): Chấp nhận.
- Giới hạn: 300 lượt (Admin có thể điều chỉnh trong DB/Settings).


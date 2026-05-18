# 🩺 HỆ THỐNG ĐĂNG KÝ & TẦM SOÁT UNG THƯ TUYẾN TIỀN LIỆT
## 📌 Bệnh Viện Trung Ương Huế — Địa chỉ tên miền: [sangloctuyentienliet.com](https://sangloctuyentienliet.com)

Hệ thống quản lý chương trình khám tầm soát miễn phí ung thư tuyến tiền liệt (PCa) cộng đồng chất lượng cao, tích hợp cổng đăng ký bệnh nhân tự động hóa bằng phễu khảo sát y khoa, công nghệ cấp phát mã thẻ QR định danh số (Digital QR Badge) và hệ thống bảng quản trị thông minh (Real-time Dashboards) thích ứng trên mọi loại thiết bị di động.

---

## 💎 CÁC TÍNH NĂNG NỔI BẬT (KEY FEATURES)

Hệ thống được thiết kế theo các tiêu chuẩn kỹ thuật hiện đại, kết hợp thẩm mỹ UI/UX cao cấp và tính ứng dụng thực tiễn vượt trội tại hiện trường bệnh viện:

### 1. Phễu Đăng Ký & Sàng Lọc Y Khoa Sinh Động (`/quy-trinh`)
* **Trải nghiệm mượt mà**: Quy trình 6 bước được dàn dựng sinh động bằng hiệu ứng chuyển động của `framer-motion` và phối màu gradient chuyên nghiệp chuẩn y khoa.
* **Thuật toán lọc độ tuổi tự động**: Sàng lọc chính xác đối tượng dựa trên năm sinh (tính mốc chốt ngày **01/06/2026**):
  - Từ chối < 45 tuổi.
  - Chấp nhận 45 - 50 tuổi nếu có tiền sử gia đình bị K trực hệ hoặc mang gen đột biến BRCA.
  - Chấp nhận mặc định đối với khách hàng >= 50 tuổi.
* **Hạn mức thông minh**: Giới hạn chỉ nhận 300 suất khám chuẩn (Admin có thể tự do mở rộng hạn ngạch).

### 2. Thẻ Đăng Ký QR Số Hóa (Digital QR Badge)
* **Check-in không chạm**: Sau khi hoàn thành đăng ký, bệnh nhân nhận được một thẻ khám bệnh kỹ thuật số có chứa mã QR duy nhất.
* **Tải xuống ngoại tuyến**: Hỗ trợ lưu trữ thẻ dạng hình ảnh chất lượng cao có tích hợp logo Bệnh viện Trung ương Huế (`public/logobv.boder.png`) trực tiếp về điện thoại để check-in tại viện.

### 3. Giao Diện Quản Trị Đa Nền Tảng (Mobile & Tablet Dashboards)
* **Tương thích thiết bị cầm tay**: Dashboard quản trị được tối ưu hóa responsive tuyệt đối, giúp điều phối viên lâm sàng dễ dàng mang theo iPad/Tablet làm việc cơ động tại hiện trường khám.
* **Lọc khung giờ & Thống kê động**: Giao diện Lịch khám (`CalendarTab.tsx`) hiển thị danh mục khung giờ dạng các nút nhấn linh hoạt, đếm số lượng bệnh nhân thực tế giúp điều phối hàng chờ tối ưu.
* **Click-to-Sort chuyên sâu**: Danh sách bệnh nhân hỗ trợ click trực tiếp tiêu đề cột hoặc chọn qua bảng lọc trên Mobile để sắp xếp danh sách theo Khung giờ hẹn và Trạng thái y tế ưu tiên.

### 4. Xuất Báo Cáo Excel Phân Hệ Tiếng Việt Có Dấu
* **Đa mẫu báo cáo**: Hỗ trợ CSKH và Bác sĩ xuất báo cáo chuyên biệt theo từng phân hệ (`Patients`, `Screening`, `Laboratory`, `Clinical Consult`) thay vì một bảng gộp duy nhất.
* **Tên file an toàn**: File tải về tự động mã hóa dạng tiếng Việt có dấu an toàn, chuyên nghiệp và có gắn thời gian xuất thực tế.

### 5. TrangFAQ Y Khoa PCF & Tìm Kiếm Nhanh (`/truyen-thong`)
* **Giáo dục y tế cộng đồng**: Trang FAQ được thiết kế theo tiêu chuẩn của **PCF (Prostate Cancer Foundation)** giúp người dân dễ dàng tìm kiếm, hiểu rõ tầm quan trọng của chỉ số PSA và siêu âm đo thể tích tuyến tiền liệt.

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT DIRECTORY TREE)

```bash
ScreeningProstate/
├── backend/                 # 🐍 FastAPI Backend Module
│   ├── app/
│   │   ├── main.py          # Điểm khởi chạy API và thiết lập WebSocket
│   │   ├── models.py        # Định nghĩa Schema Cơ sở dữ liệu (SQLite/PostgreSQL)
│   │   ├── database.py      # Cấu hình kết nối SQLAlchemy Engine
│   │   └── routes/          # Các endpoint xử lý API chuyên biệt
│   │       ├── auth.py      # Đăng nhập, phân quyền & xác thực cán bộ y tế
│   │       ├── admin.py     # Quản trị viên, cài đặt hệ thống, xuất Excel báo cáo
│   │       └── clinical.py  # Quét QR check-in, nhập kết quả xét nghiệm & siêu âm
│   ├── requirements.txt     # Danh sách thư viện Python
│   └── uploads/             # Thư mục lưu trữ ảnh siêu âm và tài liệu
├── frontend/                # ⚡ Next.js Frontend Module (React 18, TypeScript)
│   ├── src/
│   │   ├── pages/           # Hệ thống định tuyến (Pages Router)
│   │   │   ├── index.tsx    # Trang chủ & Phễu đăng ký bệnh nhân
│   │   │   ├── display.tsx  # Trang bảng hiển thị số thứ tự sảnh chờ
│   │   │   ├── admin/       # Dashboard dành cho CSKH và Admin tối cao
│   │   │   └── clinical/    # Dashboard dành cho bác sĩ chuyên khoa tiết niệu
│   │   ├── components/      # Các thành phần giao diện dùng chung
│   │   │   └── Admin/
│   │   │       └── CalendarTab.tsx # Bộ lọc khung giờ & Lịch khám cơ động
│   │   └── utils/           # Các hàm định dạng ngày tháng, tiền tệ dùng chung
│   ├── public/              # Tài nguyên ảnh, logo bệnh viện
│   └── package.json         # Cấu hình thư viện Node.js
└── docker-compose.yml       # 🐳 Cấu hình Docker điều phối Container
```

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT NHANH (QUICK START GUIDE)

### Môi trường phát triển cục bộ (Local Development)

#### 1. Khởi chạy FastAPI Backend
1. Yêu cầu Python từ phiên bản **3.9+** trở lên.
2. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
3. Tạo môi trường ảo và kích hoạt:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Trên Windows: venv\Scripts\activate
   ```
4. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
5. Sao chép và cấu hình file `.env` mẫu:
   ```bash
   cp .env.example .env
   ```
6. Chạy máy chủ phát triển (Reload tự động):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### 2. Khởi chạy Next.js Frontend
1. Yêu cầu Node.js từ phiên bản **18+** trở lên.
2. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
3. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
4. Sao chép và cấu hình file `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
5. Chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```

---

## 🐳 TRIỂN KHAI PRODUCTION (PRODUCTION DEPLOYMENT)

Dự án được cấu hình sẵn môi trường container hóa thông qua Docker Compose, giúp việc cài đặt lên máy chủ VPS Linux (LANIT, Vultr, AWS) trở nên đồng bộ và nhất quán tuyệt đối.

Kích hoạt hệ thống chạy ngầm trên máy chủ chỉ bằng một lệnh:
```bash
docker compose up -d --build
```
*Hệ thống sẽ tự động lắng nghe và ánh xạ cổng:*
* **Frontend Portal & Dashboard**: Cổng `3000` (được bảo vệ hoặc proxy qua Nginx SSL).
* **Backend RESTful API & WebSockets**: Cổng `8000`.

---

## 🔐 PHÂN QUYỀN HỆ THỐNG MẶC ĐỊNH (ROLE-BASED ACCESS CONTROL)

Hệ thống cung cấp cơ chế bảo mật xác thực JWT. Khi đăng nhập vào Dashboard quản trị, tài khoản cán bộ y tế sẽ được phân chia quyền năng cụ thể dựa trên 3 Role cốt lõi:
1. `SUPERADMIN`: Toàn quyền quản lý, quản trị danh sách người dùng, xóa/sửa bệnh nhân, cấu hình chỉ tiêu suất khám.
2. `CLINICAL` (Bác sĩ chuyên khoa): Tra cứu thông tin bằng máy quét QR, nhập hồ sơ khảo sát y tế, nhập chỉ số PSA, kết quả siêu âm tuyến tiền liệt và điều phối số thứ tự khám tại phòng khám.
3. `CSKH` (Chăm sóc khách hàng / Telesale): Tra cứu danh sách, gọi điện xác nhận lịch hẹn, cập nhật trạng thái lịch khám bệnh nhân.

---

> [!NOTE]
> **Khuyến nghị cho nhóm phát triển y tế tương lai:**
> - Logic phân tầng độ tuổi và lọc nguy cơ được viết tập trung tại hàm `isEligible` trong frontend.
> - Hãy tham khảo tài liệu [UPDATE.md](file:///Users/quocanhyduoc/ScreeningProstate/UPDATE.md) để nắm rõ lịch sử các phiên bản nâng cấp chức năng trước khi bổ sung bất kỳ nghiệp vụ lâm sàng mới nào.

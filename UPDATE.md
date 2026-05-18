# 📝 NHẬT KÝ NÂNG CẤP & PHÁT TRIỂN HỆ THỐNG (CHANGELOG)
## 📌 Hệ Thống Tầm Soát Ung Thư Tuyến Tiền Liệt - BV Trung Ương Huế
> Địa chỉ tên miền chính thức: **sangloctuyentienliet.com**

Tài liệu này ghi chép chi tiết toàn bộ các cột mốc nâng cấp, các phiên bản cập nhật kỹ thuật và chức năng nghiệp vụ của hệ thống từ giai đoạn sơ khai đến phiên bản hiện tại.

---

## 🚀 PHIÊN BẢN 2.1 - TỐI ƯU HÓA QUẢN TRỊ ĐA NỀN TẢNG (PHIÊN BẢN HIỆN TẠI)
*Ngày cập nhật: 18/05/2026*

Phiên bản này tập trung vào trải nghiệm thực chiến tại bệnh viện, giúp điều phối viên và nhân viên y tế dễ dàng vận hành hệ thống trực tiếp trên các thiết bị di động cầm tay (iPad, Tablet, Smartphone) tại bàn tiếp nhận nhanh.

### 🌟 Tính Năng Mới
1. **Bộ Lọc Khung Giờ Khám Trực Quan (`CalendarTab.tsx`)**:
   - Thêm bảng bộ lọc khung giờ khám dạng các nút bấm lớn, nhạy bén và hiển thị số đếm số lượng đăng ký thực tế trong từng khung giờ.
   - Hỗ trợ nhân viên y tế lọc nhanh hàng đợi khám ngay tại sảnh chờ.
2. **Sắp Xếp Danh Sách Đa Năng (Click-To-Sort & Dropdown Sort)**:
   - **Giao diện Desktop**: Cho phép bấm trực tiếp vào tiêu đề cột **Khung giờ hẹn** và **Trạng thái** để sắp xếp danh sách tăng/giảm dần với biểu tượng mũi tên chỉ hướng sinh động.
   - **Giao diện Di động/Tablet**: Tích hợp hộp chọn sắp xếp chuyên dụng ngay trong bảng lọc nâng cao để nhân viên thao tác vuốt chạm nhanh mà không cần thu phóng bảng.
3. **Nâng Cấp Xuất Dữ Liệu Excel Đa Phân Hệ & Tổng Thể (`admin.py` & `dashboard.tsx`)**:
   - **Báo cáo Phân hệ**: Xuất báo cáo riêng biệt cho từng trạm làm việc (`patients`, `clinical_screening`, `clinical_lab`, `clinical_consult`).
   - **Báo cáo Tổng thể (Mới)**: Cho phép Admin tối cao (`SUPERADMIN`) xuất file Excel tổng hợp toàn bộ hệ thống (`section=overall`) chứa **5 Sheet khác nhau** trong cùng một File (Tài khoản Nhân viên, Danh sách Đăng ký, Khảo sát Sàng lọc, Xét nghiệm & Siêu âm, Tư vấn & Trả kết quả).
   - Tên file tải về tự động đổi theo ngôn ngữ tiếng Việt dễ đọc, có gắn ngày tháng xuất báo cáo thực tế.

---

## 🎨 PHIÊN BẢN 2.0 - REDESIGN TRẢI NGHIỆM NGƯỜI DÂN & THƯƠNG HIỆU HỆ THỐNG
*Ngày cập nhật: 16/05/2026*

Đợt cập nhật lớn nhằm khoác lên hệ thống một diện mạo hoàn toàn mới, đồng thời tích hợp các nội dung truyền thông y tế cộng đồng chất lượng cao giúp tăng tỷ lệ chuyển đổi đăng ký.

### 🌟 Tính Năng Mới
1. **Redesign Giao Diện Phễu Đăng Ký 6 Bước (`/quy-trinh`)**:
   - Rút gọn và tối ưu hóa quy trình đăng ký thành phễu trải nghiệm 6 bước mượt mà:
     `Quét QR Đăng ký & Sàng lọc Lâm sàng ➔ CSKH gọi xác nhận lịch hẹn ➔ Check-in tại bàn tiếp nhận ➔ Xét nghiệm máu & Siêu âm ➔ Bác sĩ chuyên khoa tư vấn kết quả ➔ Kết thúc quy trình & Ký cam kết`.
   - Ứng dụng hiệu ứng chuyển động mượt mà của `framer-motion` cùng các dải chuyển màu (gradient) cao cấp chuẩn y khoa.
2. **Trang FAQ & Truyền Thông Y Khoa (`/truyen-thong`)**:
   - Xây dựng trang thông tin giáo dục y tế mô phỏng theo mô hình chuẩn của **PCF (Prostate Cancer Foundation)**.
   - Cung cấp kiến thức trực quan về ý nghĩa của xét nghiệm PSA, cách theo dõi sức khỏe và các câu hỏi thường gặp.
   - Tích hợp thanh tìm kiếm thông minh giúp người dân tra cứu câu hỏi cực nhanh.
3. **Đồng Bộ Thương Hiệu Bệnh Viện**:
   - Thay thế toàn bộ hình ảnh demo bằng Logo chính thức của **Bệnh viện Trung ương Huế** (`public/logobv.boder.png`).
   - Tự động hiển thị logo sắc nét trên Digital Badge và phiếu đăng ký của bệnh nhân khi tải về điện thoại.
4. **Sửa Lỗi Hiển Thị Mobile**:
   - Tối ưu hóa toàn bộ giao diện khảo sát bệnh án lâm sàng sau đăng ký, triệt tiêu hoàn toàn lỗi tràn khung, tràn text trên các thiết bị màn hình nhỏ.

---

## 🛠️ PHIÊN BẢN 1.2 - TÍCH HỢP THIẾT BỊ NGOẠI VI & QR ĐỒNG BỘ
*Ngày cập nhật: 12/05/2026*

Nâng cấp quan trọng phục vụ trực tiếp cho hoạt động Onsite tại bàn khám thực địa, tăng tốc độ xử lý thủ tục hành chính.

### 🌟 Tính Năng Mới
1. **Mô-đun Máy Quét QR Camera Tốc Độ Cao**:
   - Tích hợp thư viện quét QR bằng camera thiết bị, hỗ trợ quét mã số CCCD vật lý và mã QR Digital Badge trên điện thoại của bệnh nhân.
   - Tự động điền nhanh và truy xuất hồ sơ bệnh án của khách hàng chỉ trong vòng dưới 1 giây.
2. **Đồng Bộ Số Thứ Tự & Trạm Gọi Số**:
   - Phát triển trang hiển thị hàng đợi tại sảnh chờ (`display.tsx`) hoạt động thời gian thực qua WebSockets/API.
   - Hỗ trợ bác sĩ tại các trạm Siêu âm, Xét nghiệm máu, Khám lâm sàng bấm gọi số thứ tự tiếp theo một cách đồng bộ.

---

## 🔒 PHIÊN BẢN 1.1 - ỔN ĐỊNH BẢO MẬT & ĐƠN GIẢN HÓA ĐĂNG KÝ
*Ngày cập nhật: 11/05/2026*

Giải quyết triệt để các rào cản kỹ thuật gây gián đoạn quy trình và tối ưu hóa bảo mật hệ thống.

### 🌟 Tính Năng Mới
1. **Tối Ưu Hóa JWT Authentication**:
   - Xử lý triệt để lỗi `401 Unauthorized` bằng cách mở rộng thời gian sống của token hành chính và cấu hình cơ chế bypass bảo mật đối với cổng khảo sát lâm sàng công khai của bệnh nhân.
2. **Gỡ Bỏ OTP Xác Thực**:
   - Chuyển đổi phương thức đăng ký từ xác thực OTP sang xác thực bằng thuật toán kết hợp (CCCD + SĐT) nhằm giảm ma sát đăng ký đối với người dân lớn tuổi không thành thạo công nghệ.

---

## 🏗️ PHIÊN BẢN 1.0 - KHỞI TẠO NỀN TẢNG HỆ THỐNG
*Ngày cập nhật: 05/05/2026*

Đặt nền móng kỹ thuật và cơ sở dữ liệu cho toàn bộ chương trình tầm soát ung thư tuyến tiền liệt.

### 🌟 Tính Năng Mới
1. **Mô hình Dữ liệu Core (SQLite + SQLAlchemy)**:
   - Thiết lập cấu trúc cơ sở dữ liệu lưu trữ thông tin bệnh nhân, lịch sử tiền sử gia đình, chỉ số PSA, kết quả siêu âm và phân hạng rủi ro PI-RADS.
2. **Thuật Toán Phân Loại Độ Tuổi Lâm Sàng**:
   - Cài đặt bộ lọc sàng lọc thông minh: Từ chối người dưới 45 tuổi, kiểm tra tiền sử đối với người từ 45-50 tuổi, chỉ định khám mặc định đối với người trên 50 tuổi.
3. **Phân Quyền Người Dùng (Role-Based Access Control)**:
   - Khởi tạo 3 nhóm quyền cốt lõi: `SUPERADMIN` (quản lý tối cao), `CLINICAL` (bác sĩ khám lâm sàng), `CSKH` (điều phối telesale).


import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

def send_registration_email(patient_email, patient_name, registration_number, slot):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("⚠️ Cảnh báo: Chưa cấu hình Email SMTP. Bỏ qua gửi mail.")
        return

    # 1. Send to Patient
    if patient_email:
        try:
            msg = MIMEMultipart()
            msg['From'] = SMTP_FROM
            msg['To'] = patient_email
            msg['Subject'] = f"Xác nhận đăng ký tầm soát - #{registration_number}"

            body = f"""
            <html>
            <body>
                <h2 style="color: #0067b8;">Kính chào Ông {patient_name},</h2>
                <p>Cám ơn Ông đã hoàn thành đăng ký thông tin và khảo sát sàng lọc cho chương trình <b>Tầm soát Ung thư Tuyến tiền liệt 2026</b>.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #dee2e6;">
                    <p><b>Mã số thứ tự:</b> <span style="font-size: 18px; color: #0067b8;">#{str(registration_number).padStart(3, '0')}</span></p>
                    <p><b>Thời gian hẹn:</b> {slot}</p>
                    <p><b>Địa điểm:</b> Bệnh viện Quốc tế Trung ương Huế (03 Ngô Quyền, Huế)</p>
                </div>

                <p style="color: #dc3545; font-weight: bold;">Lưu ý quan trọng:</p>
                <ul>
                    <li>Vui lòng đến đúng khung giờ đã đăng ký để được phục vụ tốt nhất.</li>
                    <li>Mang theo thẻ CCCD khi đến khám.</li>
                    <li>Lưu lại mã QR đã được cấp trên website để check-in nhanh chóng.</li>
                </ul>

                <p>Trân trọng,<br>Ban tổ chức Chương trình</p>
            </body>
            </html>
            """
            msg.attach(MIMEText(body, 'html'))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
            print(f"✅ Đã gửi email xác nhận cho {patient_email}")
        except Exception as e:
            print(f"❌ Lỗi khi gửi email cho bệnh nhân: {e}")

    # 2. Send to Admin/Clinical
    if ADMIN_EMAIL:
        try:
            msg = MIMEMultipart()
            msg['From'] = SMTP_FROM
            msg['To'] = ADMIN_EMAIL
            msg['Subject'] = f"Đăng ký mới: {patient_name} - #{registration_number}"

            body = f"""
            Có một lượt đăng ký mới thành công:
            - Bệnh nhân: {patient_name}
            - STT: #{registration_number}
            - Giờ hẹn: {slot}
            - Email: {patient_email or 'N/A'}
            """
            msg.attach(MIMEText(body, 'plain'))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
            print(f"✅ Đã gửi email thông báo cho Clinical ({ADMIN_EMAIL})")
        except Exception as e:
            print(f"❌ Lỗi khi gửi email cho Clinical: {e}")

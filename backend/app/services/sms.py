import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        # Chỉ khởi tạo client nếu có đủ thông tin
        self.client = None
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)

    def send_sms_otp(self, phone: str, otp_code: str):
        """Gửi mã OTP qua tin nhắn SMS truyền thống"""
        if not self.client:
            print("⚠️ SMS Service chưa được cấu hình. Chỉ in ra Log.")
            print(f"SMS TO {phone}: Ma OTP cua ban la {otp_code}")
            return True

        try:
            message = self.client.messages.create(
                body=f"Ma OTP xac thuc tam soat cua ban la: {otp_code}. Hieu luc trong 5 phut.",
                from_=self.from_phone,
                to=phone
            )
            return True
        except Exception as e:
            print(f"❌ Lỗi gửi SMS: {str(e)}")
            return False

sms_service = SMSService()

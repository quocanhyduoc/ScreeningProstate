#!/bin/bash

# --- CONFIGURATION ---
APP_DIR="ScreeningProstate"
BACKEND_PORT=8000
FRONTEND_PORT=3000
ADMINER_PORT=8080

echo "🚀 Bắt đầu quá trình Deploy Tự động (One-Click)..."

# 1. Cài đặt Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "📦 Đang cài đặt Docker và các thành phần hệ thống..."
    sudo apt update
    sudo apt install -y docker.io docker-compose git
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# 2. Cấu hình Firewall
echo "🛡️ Đang mở cổng Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow $BACKEND_PORT/tcp
sudo ufw allow $FRONTEND_PORT/tcp
sudo ufw allow $ADMINER_PORT/tcp
sudo ufw --force enable

# 3. Thiết lập file .env (Nếu chưa có)
if [ ! -f "backend/.env" ]; then
    echo "📝 Tạo cấu hình Backend .env..."
    cp backend/.env.example backend/.env
    # Sửa DATABASE_URL để dùng trong Docker
    sed -i 's/localhost/db/g' backend/.env
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Tạo cấu hình Frontend .env.local..."
    IP_VPS=$(curl -s ifconfig.me)
    echo "NEXT_PUBLIC_API_URL=http://$IP_VPS:8000" > frontend/.env.local
    echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA" >> frontend/.env.local
fi

# 4. Khởi chạy Docker
echo "🏗️ Đang Build và chạy các Container (Vui lòng đợi)..."
docker-compose down # Tắt các bản cũ nếu có
docker-compose up -d --build

# 5. Khởi tạo Database và Tạo tài khoản Super Admin
echo "👤 Đang khởi tạo Database và tài khoản Super Admin..."
sleep 5 # Đợi Database khởi động xong
docker-compose exec -T backend python init_db.py
docker-compose exec -T backend python seed_admin.py

echo "----------------------------------------------------"
echo "✅ DEPLOY HOÀN TẤT THÀNH CÔNG!"
echo "🌐 Ứng dụng: http://$IP_VPS:$FRONTEND_PORT"
echo "📊 Quản lý Database: http://$IP_VPS:$ADMINER_PORT"
echo "👤 Tài khoản Admin mặc định: admin@gmail.com / admin123 (Vui lòng đổi sau khi đăng nhập)"
echo "----------------------------------------------------"

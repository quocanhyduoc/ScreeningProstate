#!/bin/bash

# --- CONFIGURATION ---
APP_DIR="ScreeningProstate"
BACKEND_PORT=8000
FRONTEND_PORT=3000
ADMINER_PORT=8080

echo "🚀 Bắt đầu quá trình Deploy Tự động (Resilient Version)..."

# Kiểm tra quyền root
SUDO=""
if [ "$(id -u)" != "0" ]; then
    SUDO="sudo"
fi

# 1. Cập nhật hệ thống và cài đặt công cụ cần thiết
echo "📦 Đang cập nhật hệ thống và cài đặt công cụ (Docker, Git, UFW)..."
$SUDO apt-get update
$SUDO apt-get install -y docker.io docker-compose git ufw curl

# 2. Cấu hình Firewall
echo "🛡️ Đang mở cổng Firewall..."
$SUDO ufw allow 22/tcp
$SUDO ufw allow $BACKEND_PORT/tcp
$SUDO ufw allow $FRONTEND_PORT/tcp
$SUDO ufw allow $ADMINER_PORT/tcp
echo "y" | $SUDO ufw enable

# 3. Thiết lập file .env
echo "📝 Cấu hình biến môi trường..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    # Sửa DATABASE_URL bằng cách tạo file tạm để tránh lỗi sed
    cat backend/.env | sed 's/localhost/db/g' > backend/.env.tmp && mv backend/.env.tmp backend/.env
fi

if [ ! -f "frontend/.env.local" ]; then
    IP_VPS=$(curl -s ifconfig.me)
    echo "NEXT_PUBLIC_API_URL=http://$IP_VPS:8000" > frontend/.env.local
    echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA" >> frontend/.env.local
fi

# 4. Khởi chạy Docker
echo "🏗️ Đang khởi chạy Docker..."
$SUDO systemctl start docker
$SUDO systemctl enable docker

# Thử chạy với docker-compose hoặc docker compose
DOCKER_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker compose"
fi

echo "🏗️ Đang Build các Container bằng $DOCKER_CMD..."
$DOCKER_CMD down
$DOCKER_CMD up -d --build

# 5. Khởi tạo Database và Tạo tài khoản Super Admin
echo "👤 Đang khởi tạo Database và tạo Super Admin..."
sleep 10 # Đợi Postgres khởi động
$DOCKER_CMD exec -T backend python init_db.py
$DOCKER_CMD exec -T backend python seed_admin.py

echo "----------------------------------------------------"
echo "✅ DEPLOY HOÀN TẤT THÀNH CÔNG!"
echo "🌐 Ứng dụng: http://$IP_VPS:$FRONTEND_PORT"
echo "📊 Database GUI: http://$IP_VPS:$ADMINER_PORT"
echo "👤 Admin: admin@gmail.com / admin123"
echo "----------------------------------------------------"

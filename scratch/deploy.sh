#!/bin/bash

# Ép đường dẫn hệ thống để tránh lỗi "command not found"
export PATH=$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# --- CONFIGURATION ---
APP_DIR="ScreeningProstate"
BACKEND_PORT=8000
FRONTEND_PORT=3000
ADMINER_PORT=8080

echo "🚀 Bắt đầu quá trình Deploy Tự động cho Ubuntu 22..."

# 1. Cập nhật hệ thống và cài đặt công cụ (Bỏ sudo vì đã là root)
echo "📦 Đang cài đặt Docker, Git, UFW..."
apt update -y
apt install -y docker.io docker-compose git ufw curl

# 2. Cấu hình Firewall
echo "🛡️ Đang mở cổng Firewall..."
ufw allow 22/tcp
ufw allow $BACKEND_PORT/tcp
ufw allow $FRONTEND_PORT/tcp
ufw allow $ADMINER_PORT/tcp
echo "y" | ufw enable

# 3. Thiết lập file .env
echo "📝 Cấu hình biến môi trường..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    # Sửa DATABASE_URL
    sed -i 's/localhost/db/g' backend/.env
fi

if [ ! -f "frontend/.env.local" ]; then
    IP_VPS=$(curl -s ifconfig.me)
    echo "NEXT_PUBLIC_API_URL=http://$IP_VPS:8000" > frontend/.env.local
    echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA" >> frontend/.env.local
fi

# 4. Khởi chạy Docker
echo "🏗️ Đang khởi chạy Docker..."
systemctl start docker
systemctl enable docker

# Thử chạy với docker-compose
DOCKER_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker compose"
fi

echo "🏗️ Đang Build các Container..."
IP_VPS=$(curl -s ifconfig.me)
NEXT_PUBLIC_API_URL=http://$IP_VPS:8000 $DOCKER_CMD down
NEXT_PUBLIC_API_URL=http://$IP_VPS:8000 $DOCKER_CMD up -d --build

# 5. Khởi tạo Database
echo "👤 Đang khởi tạo Database và Super Admin..."
sleep 12
$DOCKER_CMD exec -T backend python init_db.py
$DOCKER_CMD exec -T backend python seed_admin.py

echo "----------------------------------------------------"
echo "✅ DEPLOY HOÀN TẤT THÀNH CÔNG!"
echo "🌐 Ứng dụng: http://$IP_VPS:$FRONTEND_PORT"
echo "📊 Database GUI: http://$IP_VPS:$ADMINER_PORT"
echo "👤 Admin: admin@gmail.com / admin123"
echo "----------------------------------------------------"

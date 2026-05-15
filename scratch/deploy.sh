#!/bin/bash

# --- CONFIGURATION ---
# Thay đổi các thông tin này nếu cần
APP_DIR="ScreeningProstate"
BACKEND_PORT=8000
FRONTEND_PORT=3000

echo "🚀 Bắt đầu quá trình chuẩn bị deploy cho $APP_DIR..."

# 1. Cài đặt Docker & Docker Compose (cho Ubuntu)
if ! command -v docker &> /dev/null; then
    echo "📦 Đang cài đặt Docker..."
    sudo apt update
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    echo "✅ Đã cài đặt Docker."
else
    echo "✅ Docker đã được cài đặt."
fi

# 2. Cấu hình Firewall (UFW)
echo "🛡️ Đang cấu hình Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow $BACKEND_PORT/tcp
sudo ufw allow $FRONTEND_PORT/tcp
sudo ufw --force enable
echo "✅ Đã mở các cổng: 22, $BACKEND_PORT, $FRONTEND_PORT."

# 3. Kiểm tra file .env
echo "📝 Kiểm tra các file cấu hình (.env)..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️ Không tìm thấy backend/.env. Đang tạo từ .env.example..."
    cp backend/.env.example backend/.env
    echo "👉 Hãy nhớ chỉnh sửa backend/.env sau khi chạy script này!"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️ Không tìm thấy frontend/.env.local. Đang tạo từ .env.local.example..."
    cp frontend/.env.local.example frontend/.env.local
    echo "👉 Hãy nhớ chỉnh sửa frontend/.env.local sau khi chạy script này!"
fi

# 4. Build và chạy Docker
echo "🏗️ Đang build và khởi chạy các container (quá trình này có thể mất vài phút)..."
docker-compose up -d --build

# 5. Khởi tạo Database
echo "🗄️ Đang khởi tạo Database..."
docker-compose exec -T backend python init_db.py
docker-compose exec -T backend python seed_admin.py

echo "----------------------------------------------------"
echo "✅ DEPLOY HOÀN TẤT!"
echo "🌐 Frontend: http://[IP_VPS]:$FRONTEND_PORT"
echo "⚙️ Backend API: http://[IP_VPS]:$BACKEND_PORT"
echo "----------------------------------------------------"
echo "Lưu ý: Nếu bạn có Domain, hãy cài thêm Nginx làm Reverse Proxy."

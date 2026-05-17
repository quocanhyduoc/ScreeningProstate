#!/bin/bash

# ==========================================
# CẤU HÌNH THƯ MỤC VÀ BIẾN
# ==========================================
# Lấy đường dẫn tuyệt đối của thư mục chứa script
PROJECT_DIR=$(dirname $(realpath $0))

# Thư mục ẩn chứa các file backup
BACKUP_DIR="$PROJECT_DIR/.backups"

# Lấy ngày hiện tại (Format: YYYY-MM-DD)
DATE=$(date +"%Y-%m-%d")
BACKUP_FILENAME="backup_$DATE.tar.gz"
DB_TEMP_SQL="db_backup_$DATE.sql"

# Tạo thư mục backup nếu chưa tồn tại
mkdir -p "$BACKUP_DIR"

echo "==================================================="
echo "🚀 BẮT ĐẦU BACKUP VÀ CẬP NHẬT (NGÀY: $DATE)"
echo "==================================================="

# ==========================================
# BƯỚC 1: BACKUP DATABASE (POSTGRESQL) TỪ DOCKER
# ==========================================
echo "📦 1. Đang xuất (dump) dữ liệu từ PostgreSQL..."
cd "$PROJECT_DIR"

# Lấy các biến môi trường từ .env nếu cần (Sử dụng username/DB từ docker-compose)
# Tuỳ thuộc vào phiên bản docker, lệnh có thể là `docker compose` hoặc `docker-compose`
if command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker-compose"
else
    DOCKER_CMD="docker compose"
fi

# Chạy pg_dump bên trong container 'db'. Dữ liệu mặc định trong docker-compose.yml là ProstateHue26 / ProstateHue
$DOCKER_CMD exec -T db pg_dump -U ProstateHue26 ProstateHue > "$BACKUP_DIR/$DB_TEMP_SQL"

# ==========================================
# BƯỚC 2: NÉN MÃ NGUỒN (FRONTEND/BACKEND) & DATABASE
# ==========================================
echo "🗜️ 2. Đang nén mã nguồn và database..."

tar -czf "$BACKUP_DIR/$BACKUP_FILENAME" \
    --exclude=".backups" \
    --exclude="frontend/node_modules" \
    --exclude="frontend/.next" \
    --exclude="backend/venv" \
    --exclude="backend/__pycache__" \
    --exclude=".git" \
    -C "$PROJECT_DIR" .

# Sau khi nén thành công, xoá file .sql tạm để tiết kiệm dung lượng
rm "$BACKUP_DIR/$DB_TEMP_SQL"

echo "✅ Backup hoàn tất: $BACKUP_DIR/$BACKUP_FILENAME"

# ==========================================
# BƯỚC 3: DỌN DẸP BACKUP CŨ (GIỮ LẠI 5 NGÀY)
# ==========================================
echo "🧹 3. Xoá các bản backup cũ hơn 5 ngày..."
# Lệnh find sẽ tìm các file tar.gz cũ hơn 5 ngày và xoá chúng
find "$BACKUP_DIR" -type f -name "backup_*.tar.gz" -mtime +5 -exec rm -f {} \;
echo "✅ Đã dọn dẹp file cũ."

# ==========================================
# BƯỚC 4: CẬP NHẬT DOCKER CONTAINER
# ==========================================
echo "🐳 4. Đang cập nhật và khởi động lại Docker Containers..."

# (Tùy chọn) Kéo code mới nhất từ git về trước khi update container
# git pull origin main 

# Build lại các image (nếu có thay đổi trong source) và chạy lại ở chế độ background (detached)
$DOCKER_CMD up -d --build

# Dọn dẹp các images lơ lửng (dangling) do quá trình build tạo ra để giải phóng RAM/Ổ cứng
docker image prune -f

echo "==================================================="
echo "🎉 HOÀN TẤT TOÀN BỘ QUÁ TRÌNH LÚC: $(date +"%H:%M:%S")"
echo "==================================================="

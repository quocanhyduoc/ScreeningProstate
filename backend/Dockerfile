FROM python:3.9-slim

WORKDIR /app

# Cài đặt curl để hỗ trợ docker healthcheck và giám sát container
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Sử dụng gunicorn với 2 workers để tối ưu bộ nhớ RAM cho các VPS cấu hình 1GB - 2GB
CMD ["gunicorn", "app.main:app", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
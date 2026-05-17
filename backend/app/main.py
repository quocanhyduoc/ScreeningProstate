import os
import random
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import engine, get_db, Base
from .routes import registration, admin, auth as auth_routes, clinical
from .services.sms import sms_service

# Tables are created via init_db.py during deployment

app = FastAPI(title="Prostate Screening API")

# CORS Configuration
# Chỉ cho phép frontend domain truy cập API
ALLOWED_ORIGINS = [
    "http://103.149.87.0:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security: Middleware để che giấu dữ liệu nhạy cảm (Data Masking) trong Logs
import re
from fastapi import Request
import logging

logger = logging.getLogger("api_security")
logger.setLevel(logging.INFO)

async def mask_sensitive_data(body: bytes) -> str:
    body_str = body.decode('utf-8', errors='ignore')
    # Che CCCD (12 số): Giữ 3 số đầu và 3 số cuối
    body_str = re.sub(r'(\d{3})\d{6}(\d{3})', r'\1******\2', body_str)
    # Che SĐT (10 số): Giữ 3 số đầu và 3 số cuối
    body_str = re.sub(r'(\d{3})\d{4}(\d{3})', r'\1****\2', body_str)
    return body_str

@app.middleware("http")
async def security_logging_middleware(request: Request, call_next):
    # Đọc body để log (chú ý: phải khôi phục lại body để endpoint sử dụng)
    body = await request.body()
    
    # Mask dữ liệu nhạy cảm
    masked_body = await mask_sensitive_data(body) if body else ""
    if request.method in ["POST", "PUT", "PATCH"]:
        logger.info(f"[{request.method}] {request.url.path} - Payload: {masked_body}")
    
    # Tạo một iterator generator để stream lại body cho FastAPI
    async def receive():
        return {"type": "http.request", "body": body}
    request._receive = receive
    
    response = await call_next(request)
    return response

# Include Routers
app.include_router(registration.router)
app.include_router(admin.router)
app.include_router(clinical.router)
app.include_router(auth_routes.router)


@app.get("/")
def read_root():
    return {"message": "Prostate Screening API is running"}

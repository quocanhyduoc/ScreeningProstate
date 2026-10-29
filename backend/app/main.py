import os
import re
import random
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, auth
from .database import engine, get_db, Base
from .routes import registration, admin, auth as auth_routes, clinical
from .services.sms import sms_service

# Logging setup
logger = logging.getLogger("api_security")
logger.setLevel(logging.INFO)

# FastAPI App Instance
app = FastAPI(title="Prostate Screening API")

# Startup: Auto create database tables safely
@app.on_event("startup")
def startup_db():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables on startup: {e}")

# CORS Configuration
ALLOWED_ORIGINS = [
    "https://sangloctuyentienliet.com",
    "http://sangloctuyentienliet.com",
    "https://www.sangloctuyentienliet.com",
    "http://www.sangloctuyentienliet.com",
    "http://103.149.87.0",
    "https://103.149.87.0",
    "http://103.149.87.0:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    for origin in env_origins.split(","):
        trimmed = origin.strip()
        if trimmed and trimmed not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(trimmed)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security: Data masking in logs
async def mask_sensitive_data(body: bytes) -> str:
    body_str = body.decode('utf-8', errors='ignore')
    # Che CCCD (12 số): Giữ 3 số đầu và 3 số cuối
    body_str = re.sub(r'(\d{3})\d{6}(\d{3})', r'\1******\2', body_str)
    # Che SĐT (10 số): Giữ 3 số đầu và 3 số cuối
    body_str = re.sub(r'(\d{3})\d{4}(\d{3})', r'\1****\2', body_str)
    return body_str

@app.middleware("http")
async def security_logging_middleware(request: Request, call_next):
    if request.method in ["POST", "PUT", "PATCH"]:
        logger.info(f"[{request.method}] {request.url.path} - Processing secure request")
    response = await call_next(request)
    return response

# Include Routers
app.include_router(registration.router)
app.include_router(admin.router)
app.include_router(clinical.router)
app.include_router(auth_routes.router)

# Healthcheck endpoints
@app.get("/")
def read_root():
    return {"message": "Prostate Screening API is running", "status": "healthy"}

@app.get("/health")
def health():
    return {"status": "ok"}

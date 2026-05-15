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

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Prostate Screening API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(registration.router)
app.include_router(admin.router)
app.include_router(clinical.router)
app.include_router(auth_routes.router)


@app.get("/")
def read_root():
    return {"message": "Prostate Screening API is running"}

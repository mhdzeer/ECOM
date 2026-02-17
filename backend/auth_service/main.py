"""Auth Service - User authentication and authorization"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from shared.database import get_db, init_db
from . import models, schemas, routes

app = FastAPI(
    title="Auth Service",
    description="Authentication and authorization service",
    version="1.0.0"
)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()
    models.Base.metadata.create_all(bind=models.engine)

# Include routes
app.include_router(routes.router, tags=["auth"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth_service"}

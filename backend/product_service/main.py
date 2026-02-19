"""Product Service - Product catalog and inventory management"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from shared.database import init_db
from . import models, routes

app = FastAPI(
    title="Product Service",
    description="Product catalog and inventory management service",
    version="1.0.0",
    root_path=os.getenv("ROOT_PATH", "")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()
    models.Base.metadata.create_all(bind=models.engine)

# Include routes
app.include_router(routes.router, tags=["products"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "product_service"}

"""Delivery Service - Delivery tracking and courier management"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import enum
import os

from shared.database import Base, engine, get_db, init_db
from shared.auth_middleware import get_current_user, get_current_admin

app = FastAPI(title="Delivery Service", version="1.0.0")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Models
class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    FAILED = "failed"

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, unique=True, nullable=False, index=True)
    tracking_number = Column(String, unique=True, index=True)
    courier_name = Column(String)
    courier_phone = Column(String)
    status = Column(SQLEnum(DeliveryStatus), default=DeliveryStatus.PENDING)
    estimated_delivery = Column(DateTime(timezone=True))
    actual_delivery = Column(DateTime(timezone=True))
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Schemas
class DeliveryCreate(BaseModel):
    order_id: int
    courier_name: Optional[str] = None
    courier_phone: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

class DeliveryUpdate(BaseModel):
    status: DeliveryStatus
    courier_name: Optional[str] = None
    courier_phone: Optional[str] = None
    notes: Optional[str] = None

class DeliveryResponse(BaseModel):
    id: int
    order_id: int
    tracking_number: str
    courier_name: Optional[str]
    courier_phone: Optional[str]
    status: str
    estimated_delivery: Optional[datetime]
    actual_delivery: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

# Routes
@app.on_event("startup")
async def startup_event():
    init_db()
    Base.metadata.create_all(bind=engine)

@app.post("/", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
async def create_delivery(delivery_data: DeliveryCreate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Create delivery record (admin only)"""
    import random
    tracking_number = f"TRK-{random.randint(1000000, 9999999)}"
    
    delivery = Delivery(
        order_id=delivery_data.order_id,
        tracking_number=tracking_number,
        courier_name=delivery_data.courier_name,
        courier_phone=delivery_data.courier_phone,
        estimated_delivery=delivery_data.estimated_delivery
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery

@app.get("/{order_id}/track", response_model=DeliveryResponse)
async def track_delivery(order_id: int, db: Session = Depends(get_db)):
    """Track delivery by order ID"""
    delivery = db.query(Delivery).filter(Delivery.order_id == order_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery

@app.put("/{delivery_id}/update")
async def update_delivery(delivery_id: int, update_data: DeliveryUpdate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Update delivery status (admin only)"""
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    delivery.status = update_data.status
    if update_data.courier_name:
        delivery.courier_name = update_data.courier_name
    if update_data.courier_phone:
        delivery.courier_phone = update_data.courier_phone
    if update_data.notes:
        delivery.notes = update_data.notes
    if update_data.status == DeliveryStatus.DELIVERED:
        delivery.actual_delivery = datetime.utcnow()
    
    db.commit()
    db.refresh(delivery)
    return delivery

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "delivery_service"}

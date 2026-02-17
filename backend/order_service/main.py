"""Order Service - Order processing and management"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import enum
import os

from shared.database import Base, engine, get_db, init_db
from shared.auth_middleware import get_current_user, get_current_admin

app = FastAPI(title="Order Service", version="1.0.0")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Models
class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    order_number = Column(String, unique=True, index=True)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    shipping_cost = Column(Float, default=0)
    total = Column(Float, nullable=False)
    shipping_address = Column(String, nullable=False)
    billing_address = Column(String)
    phone = Column(String)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    order = relationship("Order", back_populates="items")

# Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float

class OrderItemResponse(OrderItemCreate):
    id: int
    total: float
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str
    billing_address: Optional[str] = None
    phone: str
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_number: str
    status: str
    subtotal: float
    tax: float
    shipping_cost: float
    total: float
    shipping_address: str
    phone: str
    created_at: datetime
    items: List[OrderItemResponse]
    class Config:
        from_attributes = True

# Routes
@app.on_event("startup")
async def startup_event():
    init_db()
    Base.metadata.create_all(bind=engine)

@app.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new order"""
    import random
    order_number = f"ORD-{random.randint(100000, 999999)}"
    
    subtotal = sum(item.price * item.quantity for item in order_data.items)
    tax = subtotal * 0.1  # 10% tax
    shipping_cost = 10.0
    total = subtotal + tax + shipping_cost
    
    order = Order(
        user_id=int(current_user["sub"]),
        order_number=order_number,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        shipping_address=order_data.shipping_address,
        billing_address=order_data.billing_address or order_data.shipping_address,
        phone=order_data.phone,
        notes=order_data.notes
    )
    db.add(order)
    db.flush()
    
    for item_data in order_data.items:
        item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            product_name=item_data.product_name,
            quantity=item_data.quantity,
            price=item_data.price,
            total=item_data.price * item_data.quantity
        )
        db.add(item)
    
    db.commit()
    db.refresh(order)
    return order

@app.get("/", response_model=List[OrderResponse])
async def list_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """List user's orders"""
    orders = db.query(Order).filter(Order.user_id == int(current_user["sub"])).order_by(Order.created_at.desc()).all()
    return orders

@app.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get order by ID"""
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == int(current_user["sub"])).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/{order_id}/status")
async def update_order_status(order_id: int, status: OrderStatus, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Update order status (admin only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"message": "Order status updated", "status": status}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "order_service"}

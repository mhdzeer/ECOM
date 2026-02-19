"""Coupon / Discount Code Service"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import enum
import os

from shared.database import Base, engine, get_db, init_db
from shared.auth_middleware import get_current_user, get_current_admin

app = FastAPI(title="Coupon Service", version="1.0.0", root_path=os.getenv("ROOT_PATH", ""))
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_SHIPPING = "free_shipping"

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(200))
    discount_type = Column(SQLEnum(DiscountType), nullable=False)
    discount_value = Column(Float, default=0)  # % or $ amount
    min_order_amount = Column(Float, default=0)
    max_discount_amount = Column(Float, nullable=True)
    usage_limit = Column(Integer, nullable=True)  # None = unlimited
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Schemas
class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    discount_type: DiscountType
    discount_value: float = Field(..., ge=0)
    min_order_amount: float = 0
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    expires_at: Optional[datetime] = None

class CouponResponse(BaseModel):
    id: int
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_discount_amount: Optional[float]
    usage_limit: Optional[int]
    usage_count: int
    is_active: bool
    expires_at: Optional[datetime]
    class Config:
        from_attributes = True

class ApplyCouponRequest(BaseModel):
    code: str
    order_total: float

class ApplyCouponResponse(BaseModel):
    valid: bool
    message: str
    discount_amount: float = 0
    coupon: Optional[CouponResponse] = None

@app.on_event("startup")
async def startup_event():
    init_db()
    Base.metadata.create_all(bind=engine)

@app.post("/apply", response_model=ApplyCouponResponse)
async def apply_coupon(
    request: ApplyCouponRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate and calculate coupon discount"""
    coupon = db.query(Coupon).filter(
        Coupon.code == request.code.upper(),
        Coupon.is_active == True
    ).first()

    if not coupon:
        return ApplyCouponResponse(valid=False, message="Coupon code not found or expired")

    # Check expiry
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return ApplyCouponResponse(valid=False, message="This coupon has expired")

    # Check usage limit
    if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
        return ApplyCouponResponse(valid=False, message="This coupon has reached its usage limit")

    # Check minimum order
    if request.order_total < coupon.min_order_amount:
        return ApplyCouponResponse(
            valid=False,
            message=f"Minimum order amount is ${coupon.min_order_amount:.2f}"
        )

    # Calculate discount
    discount = 0.0
    if coupon.discount_type == DiscountType.PERCENTAGE:
        discount = request.order_total * (coupon.discount_value / 100)
        if coupon.max_discount_amount:
            discount = min(discount, coupon.max_discount_amount)
    elif coupon.discount_type == DiscountType.FIXED:
        discount = min(coupon.discount_value, request.order_total)
    elif coupon.discount_type == DiscountType.FREE_SHIPPING:
        discount = 5.99  # Standard shipping cost

    return ApplyCouponResponse(
        valid=True,
        message=f"Coupon applied! You save ${discount:.2f}",
        discount_amount=round(discount, 2),
        coupon=coupon
    )

@app.post("/use/{code}")
async def mark_coupon_used(
    code: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Increment coupon usage after successful order"""
    coupon = db.query(Coupon).filter(Coupon.code == code.upper()).first()
    if coupon:
        coupon.usage_count += 1
        db.commit()
    return {"message": "OK"}

# Admin routes
@app.get("/admin/all", response_model=list[CouponResponse])
async def list_all_coupons(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()

@app.post("/admin", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    data: CouponCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    data_dict = data.dict()
    data_dict['code'] = data_dict['code'].upper()
    coupon = Coupon(**data_dict)
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

@app.put("/admin/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: int,
    data: CouponCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.dict().items():
        setattr(coupon, k, v)
    coupon.code = coupon.code.upper()
    db.commit()
    db.refresh(coupon)
    return coupon

@app.delete("/admin/{coupon_id}")
async def delete_coupon(
    coupon_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    c = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "coupon_service"}

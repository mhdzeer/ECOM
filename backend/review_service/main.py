"""Review Service - Product reviews and ratings (runs inside order_service or as separate)"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os

from shared.database import Base, engine, get_db, init_db
from shared.auth_middleware import get_current_user, get_current_admin

app = FastAPI(
    title="Review Service",
    version="1.0.0",
    root_path=os.getenv("ROOT_PATH", "")
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

# Models
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False)
    user_name = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String(200))
    body = Column(Text)
    is_verified_purchase = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=True)
    helpful_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Schemas
class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    body: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    user_name: str
    rating: int
    title: Optional[str]
    body: Optional[str]
    is_verified_purchase: bool
    helpful_count: int
    created_at: datetime
    class Config:
        from_attributes = True

class ProductRatingSummary(BaseModel):
    product_id: int
    average_rating: float
    total_reviews: int
    rating_breakdown: dict  # {1: count, 2: count, ...}

# Startup
@app.on_event("startup")
async def startup_event():
    init_db()
    Base.metadata.create_all(bind=engine)

# Routes
@app.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a product review"""
    # One review per user per product
    existing = db.query(Review).filter(
        Review.product_id == review_data.product_id,
        Review.user_id == int(current_user["sub"])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    review = Review(
        product_id=review_data.product_id,
        user_id=int(current_user["sub"]),
        user_name=current_user.get("username", "Customer"),
        rating=review_data.rating,
        title=review_data.title,
        body=review_data.body,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@app.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a product"""
    reviews = db.query(Review).filter(
        Review.product_id == product_id,
        Review.is_approved == True
    ).order_by(Review.created_at.desc()).all()
    return reviews

@app.get("/product/{product_id}/summary", response_model=ProductRatingSummary)
async def get_rating_summary(product_id: int, db: Session = Depends(get_db)):
    """Get rating summary for a product"""
    reviews = db.query(Review).filter(
        Review.product_id == product_id,
        Review.is_approved == True
    ).all()

    if not reviews:
        return ProductRatingSummary(
            product_id=product_id,
            average_rating=0,
            total_reviews=0,
            rating_breakdown={1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        )

    breakdown = {i: 0 for i in range(1, 6)}
    total_rating = 0
    for r in reviews:
        breakdown[r.rating] = breakdown.get(r.rating, 0) + 1
        total_rating += r.rating

    return ProductRatingSummary(
        product_id=product_id,
        average_rating=round(total_rating / len(reviews), 1),
        total_reviews=len(reviews),
        rating_breakdown=breakdown
    )

@app.post("/{review_id}/helpful")
async def mark_helpful(review_id: int, db: Session = Depends(get_db)):
    """Mark a review as helpful"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.helpful_count += 1
    db.commit()
    return {"helpful_count": review.helpful_count}

@app.get("/admin/all", response_model=List[ReviewResponse])
async def admin_list_reviews(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin: list all reviews"""
    return db.query(Review).order_by(Review.created_at.desc()).all()

@app.put("/admin/{review_id}/approve")
async def approve_review(
    review_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Not found")
    review.is_approved = True
    db.commit()
    return {"message": "Approved"}

@app.delete("/admin/{review_id}")
async def delete_review(
    review_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(review)
    db.commit()
    return {"message": "Deleted"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "review_service"}

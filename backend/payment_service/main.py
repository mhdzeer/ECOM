"""Payment Service - Payment processing with Stripe"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from pydantic import BaseModel
from datetime import datetime
import stripe
import os

from shared.database import Base, engine, get_db, init_db
from shared.auth_middleware import get_current_user

app = FastAPI(title="Payment Service", version="1.0.0")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_your_stripe_key")

# Models
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="usd")
    stripe_payment_intent_id = Column(String, unique=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Schemas
class PaymentIntentCreate(BaseModel):
    order_id: int
    amount: float
    currency: str = "usd"

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str

# Routes
@app.on_event("startup")
async def startup_event():
    init_db()
    Base.metadata.create_all(bind=engine)

@app.post("/intent", response_model=PaymentIntentResponse)
async def create_payment_intent(payment_data: PaymentIntentCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create Stripe payment intent"""
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(payment_data.amount * 100),  # Convert to cents
            currency=payment_data.currency,
            metadata={"order_id": payment_data.order_id, "user_id": current_user["sub"]}
        )
        
        payment = Payment(
            order_id=payment_data.order_id,
            user_id=int(current_user["sub"]),
            amount=payment_data.amount,
            currency=payment_data.currency,
            stripe_payment_intent_id=intent.id,
            status="pending"
        )
        db.add(payment)
        db.commit()
        
        return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_test")
        )
        
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            payment = db.query(Payment).filter(Payment.stripe_payment_intent_id == payment_intent["id"]).first()
            if payment:
                payment.status = "succeeded"
                db.commit()
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "payment_service"}

"""Notification Service - Handles emails and other notifications"""
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = FastAPI(title="Notification Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

# Configuration (using placeholder SMTP for demo)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "notifications@alzain.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
DEFAULT_FROM = os.getenv("DEFAULT_FROM", "AlZain Store <no-reply@alzain.com>")

class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str
    html_content: Optional[str] = None

def send_email_sync(to_email: str, subject: str, body: str, html_content: Optional[str] = None):
    """Utility to send email using SMTP"""
    if not SMTP_PASSWORD:
        print(f"DEBUG: Email to {to_email} skipped (No SMTP password). Subject: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = DEFAULT_FROM
    msg["To"] = to_email

    msg.attach(MIMEText(body, "plain"))
    if html_content:
        msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")

@app.post("/send-email")
async def send_email(request: EmailRequest, background_tasks: BackgroundTasks):
    """Endpoint to send an email asynchronously"""
    background_tasks.add_task(
        send_email_sync, 
        request.to_email, 
        request.subject, 
        request.body, 
        request.html_content
    )
    return {"message": "Email queued for sending"}

@app.post("/order-confirmation")
async def order_confirmation(
    email: EmailStr, 
    order_number: str, 
    total: float, 
    background_tasks: BackgroundTasks
):
    """Templates for order confirmation"""
    subject = f"Order Confirmation - {order_number}"
    body = f"Thank you for your order {order_number}. Your total is ${total:.2f}. We are processing it now."
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2563eb;">Thank You for Your Order!</h2>
        <p>Hi there,</p>
        <p>Order <strong>#{order_number}</strong> has been received and is being processed.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Total Amount:</strong> ${total:.2f}</p>
        </div>
        <p>We'll notify you once your order has been shipped.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280;">Alzain Store - Premium Ecommerce</p>
    </div>
    """
    background_tasks.add_task(send_email_sync, email, subject, body, html)
    return {"message": "Order confirmation email queued"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "notification_service"}

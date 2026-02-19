#!/usr/bin/env python3
"""
Script to create the default admin user in the database.
Run this once after first deployment.
Usage: docker exec -it ecom_auth_service python -m create_admin
Or: python create_admin.py
"""
import sys
import os

# Add the backend shared module to path
sys.path.insert(0, '/app')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
import bcrypt
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ecom_user:ecom_password@postgres:5432/ecom_db")

def create_admin():
    engine = create_engine(DATABASE_URL)
    
    # Admin credentials
    admin_email = os.getenv("ADMIN_EMAIL", "admin@alzain.shop")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin@2024!")
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_name = os.getenv("ADMIN_NAME", "AlZain Administrator")
    
    with Session(engine) as session:
        # Check if admin already exists
        result = session.execute(
            text("SELECT id FROM users WHERE email = :email OR role = 'admin'"),
            {"email": admin_email}
        ).fetchone()
        
        if result:
            print(f"✅ Admin user already exists (ID: {result[0]})")
            # Update role to admin just in case
            session.execute(
                text("UPDATE users SET role = 'admin' WHERE email = :email"),
                {"email": admin_email}
            )
            session.commit()
            print("✅ Role confirmed as admin")
            return
        
        # Hash password
        hashed = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
        
        # Insert admin
        session.execute(
            text("""
                INSERT INTO users (email, username, full_name, hashed_password, role, is_active, is_verified, created_at)
                VALUES (:email, :username, :full_name, :password, 'admin', true, true, NOW())
            """),
            {
                "email": admin_email,
                "username": admin_username,
                "full_name": admin_name,
                "password": hashed
            }
        )
        session.commit()
        
    print(f"""
✅ Admin user created successfully!

📧 Email:    {admin_email}
🔑 Password: {admin_password}
👤 Role:     admin

⚠️  Please change the password after first login!
    """)

if __name__ == "__main__":
    create_admin()

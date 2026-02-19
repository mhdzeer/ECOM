"""API routes for auth service"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from shared.database import get_db
from shared.auth_middleware import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from . import models, schemas

router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    existing_username = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=models.UserRole.CUSTOMER
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=schemas.Token)
async def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserDetailResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information with addresses"""
    user = db.query(models.User).filter(models.User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/addresses", response_model=list[schemas.AddressResponse])
async def get_user_addresses(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all addresses for current user"""
    addresses = db.query(models.UserAddress).filter(models.UserAddress.user_id == int(current_user["sub"])).all()
    return addresses

@router.post("/addresses", response_model=schemas.AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_user_address(
    address_data: schemas.AddressCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new address to user's address book"""
    user_id = int(current_user["sub"])
    
    # If this is the first address or set as default, handle it
    if address_data.is_default:
        db.query(models.UserAddress).filter(models.UserAddress.user_id == user_id).update({"is_default": False})

    new_address = models.UserAddress(
        **address_data.dict(),
        user_id=user_id
    )
    
    # If it's the only address, make it default
    existing_count = db.query(models.UserAddress).filter(models.UserAddress.user_id == user_id).count()
    if existing_count == 0:
        new_address.is_default = True

    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    
    return new_address

@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_address(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an address from user's address book"""
    address = db.query(models.UserAddress).filter(
        models.UserAddress.id == address_id,
        models.UserAddress.user_id == int(current_user["sub"])
    ).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    db.delete(address)
    db.commit()
    return None

@router.post("/change-password")
async def change_password(
    password_data: schemas.PasswordChange,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    user = db.query(models.User).filter(models.User.id == int(current_user["sub"])).first()
    
    if not verify_password(password_data.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client should delete token)"""
    return {"message": "Logged out successfully"}

"""Cart Service - Shopping cart management with Redis"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os

from shared.redis_client import get_redis
from shared.auth_middleware import get_current_user

app = FastAPI(
    title="Cart Service", 
    version="1.0.0",
    root_path=os.getenv("ROOT_PATH", "")
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class CartItem(BaseModel):
    product_id: int
    quantity: int
    price: float

class CartResponse(BaseModel):
    items: List[CartItem]
    total: float

@app.get("/", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_user), redis = Depends(get_redis)):
    """Get user's cart"""
    user_id = current_user["sub"]
    cart_data = redis.get(f"cart:{user_id}")
    if not cart_data:
        return {"items": [], "total": 0}
    items = json.loads(cart_data)
    total = sum(item["price"] * item["quantity"] for item in items)
    return {"items": items, "total": total}

@app.post("/add")
async def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user), redis = Depends(get_redis)):
    """Add item to cart"""
    user_id = current_user["sub"]
    cart_data = redis.get(f"cart:{user_id}")
    items = json.loads(cart_data) if cart_data else []
    
    # Update quantity if product exists
    existing = next((i for i in items if i["product_id"] == item.product_id), None)
    if existing:
        existing["quantity"] += item.quantity
    else:
        items.append(item.dict())
    
    redis.setex(f"cart:{user_id}", 86400 * 7, json.dumps(items))  # 7 days expiry
    return {"message": "Item added to cart"}

@app.put("/update")
async def update_cart_item(item: CartItem, current_user: dict = Depends(get_current_user), redis = Depends(get_redis)):
    """Update cart item quantity"""
    user_id = current_user["sub"]
    cart_data = redis.get(f"cart:{user_id}")
    if not cart_data:
        raise HTTPException(status_code=404, detail="Cart is empty")
    
    items = json.loads(cart_data)
    existing = next((i for i in items if i["product_id"] == item.product_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    existing["quantity"] = item.quantity
    redis.setex(f"cart:{user_id}", 86400 * 7, json.dumps(items))
    return {"message": "Cart updated"}

@app.delete("/remove/{product_id}")
async def remove_from_cart(product_id: int, current_user: dict = Depends(get_current_user), redis = Depends(get_redis)):
    """Remove item from cart"""
    user_id = current_user["sub"]
    cart_data = redis.get(f"cart:{user_id}")
    if not cart_data:
        raise HTTPException(status_code=404, detail="Cart is empty")
    
    items = json.loads(cart_data)
    items = [i for i in items if i["product_id"] != product_id]
    redis.setex(f"cart:{user_id}", 86400 * 7, json.dumps(items))
    return {"message": "Item removed"}

@app.delete("/clear")
async def clear_cart(current_user: dict = Depends(get_current_user), redis = Depends(get_redis)):
    """Clear entire cart"""
    user_id = current_user["sub"]
    redis.delete(f"cart:{user_id}")
    return {"message": "Cart cleared"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cart_service"}

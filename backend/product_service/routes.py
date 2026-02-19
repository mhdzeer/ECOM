"""API routes for product service"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import math

from shared.database import get_db
from shared.auth_middleware import get_current_admin
from . import models, schemas

router = APIRouter()

# Category Routes
@router.post("/categories", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Create a new category (admin only)"""
    category = models.Category(**category_data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/categories", response_model=list[schemas.CategoryResponse])
async def list_categories(db: Session = Depends(get_db)):
    """List all active categories"""
    categories = db.query(models.Category).filter(models.Category.is_active == True).all()
    return categories

@router.get("/categories/{category_id}", response_model=schemas.CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get category by ID"""
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# Attribute Routes
@router.post("/attributes", response_model=schemas.AttributeResponse, status_code=status.HTTP_201_CREATED)
async def create_attribute(
    attribute_data: schemas.AttributeCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    attr = models.Attribute(**attribute_data.dict())
    db.add(attr)
    db.commit()
    db.refresh(attr)
    return attr

@router.get("/attributes", response_model=list[schemas.AttributeResponse])
async def list_attributes(db: Session = Depends(get_db)):
    return db.query(models.Attribute).all()

@router.post("/attribute-options", response_model=schemas.AttributeOptionResponse, status_code=status.HTTP_201_CREATED)
async def create_attribute_option(
    option_data: schemas.AttributeOptionCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    opt = models.AttributeOption(**option_data.dict())
    db.add(opt)
    db.commit()
    db.refresh(opt)
    return opt

# Product Routes
@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Create a new product (admin only)"""
    # Extract images data
    images_data = product_data.images
    product_dict = product_data.dict(exclude={"images"})
    
    # Create product
    product = models.Product(**product_dict)
    db.add(product)
    db.flush()
    
    # Add images
    for img_data in images_data:
        image = models.ProductImage(**img_data.dict(), product_id=product.id)
        db.add(image)
    
    db.commit()
    db.refresh(product)
    return product

@router.post("/{product_id}/variants", response_model=schemas.ProductVariantResponse)
async def create_product_variant(
    product_id: int,
    variant_data: schemas.ProductVariantCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    variant_dict = variant_data.dict(exclude={"attribute_option_ids"})
    variant = models.ProductVariant(**variant_dict, product_id=product_id)
    db.add(variant)
    db.flush()
    
    for opt_id in variant_data.attribute_option_ids:
        db.add(models.ProductVariantAttribute(variant_id=variant.id, option_id=opt_id))
    
    db.commit()
    db.refresh(variant)
    return variant

@router.get("/{product_id}/variants", response_model=List[schemas.ProductVariantResponse])
async def list_product_variants(product_id: int, db: Session = Depends(get_db)):
    return db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).all()

@router.get("/", response_model=schemas.ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """List products with pagination and filters"""
    query = db.query(models.Product).filter(models.Product.is_active == True)
    
    # Apply filters
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(search_term),
                models.Product.description.ilike(search_term),
                models.Product.sku.ilike(search_term)
            )
        )
    
    if is_featured is not None:
        query = query.filter(models.Product.is_featured == is_featured)
    
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    
    # Get total count
    total = query.count()
    total_pages = math.ceil(total / page_size)
    
    # Apply pagination
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{product_id}", response_model=schemas.ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
async def update_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Update product (admin only)"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Delete product (admin only)"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return None

@router.post("/{product_id}/stock")
async def update_stock(
    product_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Update product stock quantity (admin only)"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.stock_quantity = quantity
    db.commit()
    
    return {"message": "Stock updated", "new_quantity": quantity}

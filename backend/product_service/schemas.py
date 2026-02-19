"""Pydantic schemas for product service"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Product Image Schemas
class ProductImageBase(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Attribute & Variant Schemas
class AttributeOptionBase(BaseModel):
    value: str

class AttributeOptionCreate(AttributeOptionBase):
    attribute_id: int

class AttributeOptionResponse(AttributeOptionBase):
    id: int
    attribute_id: int
    class Config:
        from_attributes = True

class AttributeBase(BaseModel):
    name: str

class AttributeCreate(AttributeBase):
    pass

class AttributeResponse(AttributeBase):
    id: int
    options: List[AttributeOptionResponse] = []
    class Config:
        from_attributes = True

class ProductVariantAttributeResponse(BaseModel):
    option_id: int
    option: AttributeOptionResponse
    class Config:
        from_attributes = True

class ProductVariantBase(BaseModel):
    sku: str
    price: Optional[float] = None
    stock_quantity: int = 0
    is_active: bool = True

class ProductVariantCreate(ProductVariantBase):
    attribute_option_ids: List[int]

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int
    attributes: List[ProductVariantAttributeResponse] = []
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float = Field(..., gt=0)
    compare_price: Optional[float] = None
    cost_price: Optional[float] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    weight: Optional[float] = None
    is_active: bool = True
    is_featured: bool = False

class ProductCreate(ProductBase):
    images: Optional[List[ProductImageCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    compare_price: Optional[float] = None
    cost_price: Optional[float] = None
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    weight: Optional[float] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

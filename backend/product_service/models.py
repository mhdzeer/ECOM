"""Database models for product service"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from shared.database import Base, engine

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    products = relationship("Product", back_populates="category")
    parent = relationship("Category", remote_side=[id], backref="children")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    short_description = Column(String(500))
    price = Column(Float, nullable=False)
    compare_price = Column(Float, nullable=True)  # Original price for discounts
    cost_price = Column(Float, nullable=True)  # For profit calculations
    sku = Column(String, unique=True, index=True)
    barcode = Column(String, unique=True, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    stock_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    weight = Column(Float, nullable=True)  # in kg
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    alt_text = Column(String)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product", back_populates="images")

class Attribute(Base):
    __tablename__ = "attributes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # e.g. "Color", "Size"
    
    options = relationship("AttributeOption", back_populates="attribute", cascade="all, delete-orphan")

class AttributeOption(Base):
    __tablename__ = "attribute_options"
    id = Column(Integer, primary_key=True, index=True)
    attribute_id = Column(Integer, ForeignKey("attributes.id"), nullable=False)
    value = Column(String, nullable=False) # e.g. "Red", "XL"
    
    attribute = relationship("Attribute", back_populates="options")

class ProductVariant(Base):
    __tablename__ = "product_variants"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float, nullable=True) # If None, use base product price
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    product = relationship("Product", back_populates="variants")
    attributes = relationship("ProductVariantAttribute", back_populates="variant", cascade="all, delete-orphan")

class ProductVariantAttribute(Base):
    __tablename__ = "product_variant_attributes"
    variant_id = Column(Integer, ForeignKey("product_variants.id"), primary_key=True)
    option_id = Column(Integer, ForeignKey("attribute_options.id"), primary_key=True)
    
    variant = relationship("ProductVariant", back_populates="attributes")
    option = relationship("AttributeOption")

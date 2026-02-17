-- Initialize database with seed data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, hashed_password, full_name, role, is_active, is_verified)
VALUES (
    'admin@ecommerce.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS/ZWJgya',
    'System Administrator',
    'admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories', true),
('Clothing', 'clothing', 'Fashion and apparel', true),
('Books', 'books', 'Books and publications', true),
('Home & Garden', 'home-garden', 'Home and garden products', true),
('Sports', 'sports', 'Sports and outdoor equipment', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, category_id, stock_quantity, is_active, is_featured)
SELECT 
    'Wireless Headphones',
    'wireless-headphones',
    'High-quality wireless headphones with noise cancellation',
    'Premium wireless headphones',
    99.99,
    129.99,
    'WH-001',
    c.id,
    50,
    true,
    true
FROM categories c WHERE c.slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, sku, category_id, stock_quantity, is_active, is_featured)
SELECT 
    'Cotton T-Shirt',
    'cotton-tshirt',
    'Comfortable 100% cotton t-shirt',
    'Classic cotton tee',
    19.99,
    'TS-001',
    c.id,
    100,
    true,
    false
FROM categories c WHERE c.slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

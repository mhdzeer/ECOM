"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [loading, setLoading] = useState(true);

    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';
    const apiUrl = `http://${domain}:39101/api/products`;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${apiUrl}/`);
            setProducts(response.data.products || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setShowCart(true);
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh', color: '#1a1a1a' }}>
            {/* Navigation */}
            <nav style={{
                padding: '20px 5%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                borderBottom: '1px solid #eee'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px' }}>
                    ALZAIN<span style={{ color: '#3b82f6' }}>SHOP</span>
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <a href="#" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500' }}>Shop</a>
                    <a href="#" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500' }}>Categories</a>
                    <button
                        onClick={() => setShowCart(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        🛒
                        {cart.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '50%',
                                fontWeight: 'bold'
                            }}>
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: '80px 5%',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '4rem', fontWeight: '900', margin: 0, color: '#111827', letterSpacing: '-2px' }}>
                    Discovery Premium <span style={{ color: '#3b82f6' }}>Products</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#6b7280', marginTop: '20px', maxWidth: '600px', marginInline: 'auto' }}>
                    Shop the latest trends in high-quality fashion curriculum and essentials curated just for you.
                </p>
            </section>

            {/* Product Grid */}
            <main style={{ padding: '0 5% 80px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Featured Items</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '30px'
                }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#9ca3af' }}>
                            Loading curated selection...
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#9ca3af' }}>
                            Our collection is coming soon. Stay tuned!
                        </div>
                    ) : (
                        products.map((p) => (
                            <div key={p.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                border: '1px solid #f3f4f6',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ backgroundColor: '#f9fafb', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                                    📦
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Essential</div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{p.name}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '8px', minHeight: '40px' }}>{p.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>${p.price}</span>
                                        <button
                                            onClick={() => addToCart(p)}
                                            style={{
                                                backgroundColor: '#111827',
                                                color: 'white',
                                                padding: '10px 20px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Cart Sidebar/Drawer */}
            {showCart && (
                <div style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0,
                    width: '100%', maxWidth: '450px',
                    backgroundColor: 'white',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                    zIndex: 2000,
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Your Cart</h2>
                        <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {cart.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '100px' }}>Your cart is empty.</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product.id} style={{ display: 'flex', gap: '15px', marginBottom: '25px', paddingBottom: '25px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f9fafb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                        📦
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0 }}>{item.product.name}</h4>
                                        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '5px 0' }}>Qty: {item.quantity}</p>
                                        <div style={{ fontWeight: '700' }}>${item.product.price * item.quantity}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: '40px', borderTop: '2px solid #f3f4f6', paddingTop: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', marginBottom: '30px' }}>
                            <span>Total</span>
                            <span>${cartTotal}</span>
                        </div>
                        <button
                            disabled={cart.length === 0}
                            style={{
                                width: '100%',
                                backgroundColor: cart.length > 0 ? '#3b82f6' : '#9ca3af',
                                color: 'white',
                                padding: '18px',
                                borderRadius: '16px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                cursor: cart.length > 0 ? 'pointer' : 'default'
                            }}
                        >
                            Checkout Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

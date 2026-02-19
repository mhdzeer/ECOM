"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
    images: { image_url: string }[];
}

interface CartItem {
    product: {
        id: number;
        name: string;
        price: number;
    };
    quantity: number;
}

export default function Home() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [loading, setLoading] = useState(true);

    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';
    const apiUrl = `http://${domain}:39101/api/products`;

    useEffect(() => {
        fetchProducts();
        // Load cart from local storage
        const savedCart = localStorage.getItem('ecom_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem('ecom_cart', JSON.stringify(cart));
    }, [cart]);

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
            return [...prev, { product: { id: product.id, name: product.name, price: product.price }, quantity: 1 }];
        });
        setShowCart(true);
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.product.id !== id));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh', color: '#1a1a1a' }}>
            <Navigation cartCount={cartCount} onCartClick={() => setShowCart(true)} />

            {/* Hero Section */}
            <section style={{
                padding: '80px 5%',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '4rem', fontWeight: '900', margin: 0, color: '#111827', letterSpacing: '-2px' }}>
                    Discover Luxury <span style={{ color: '#3b82f6' }}>Essentials</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#6b7280', marginTop: '20px', maxWidth: '600px', marginInline: 'auto' }}>
                    Elevate your lifestyle with our curated collection of premium products, designed for style and durability.
                </p>
            </section>

            {/* Product Grid */}
            <main style={{ padding: '0 5% 80px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '800' }}>Featured Collection</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#9ca3af' }}>
                            Loading the latest arrivals...
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', backgroundColor: '#f9fafb', borderRadius: '30px' }}>
                            <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Our catalog is currently getting an update. Check back soon!</p>
                        </div>
                    ) : (
                        products.map((p) => (
                            <div key={p.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                border: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    backgroundColor: '#f9fafb',
                                    height: '320px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '4rem',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    {p.images?.[0] ? (
                                        <img src={p.images[0].image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                                    ) : '📦'}
                                    {p.stock_quantity === 0 && (
                                        <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 15px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700' }}>OUT OF STOCK</div>
                                    )}
                                </div>
                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>New Arrival</div>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#111827', fontWeight: '700' }}>{p.name}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '10px', minHeight: '45px', lineHeight: '1.5' }}>{p.description}</p>

                                    <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#111827' }}>${p.price.toFixed(2)}</div>
                                        <button
                                            disabled={p.stock_quantity === 0}
                                            onClick={() => addToCart(p)}
                                            style={{
                                                backgroundColor: p.stock_quantity > 0 ? '#111827' : '#9ca3af',
                                                color: 'white',
                                                padding: '12px 24px',
                                                borderRadius: '14px',
                                                border: 'none',
                                                fontWeight: '700',
                                                cursor: p.stock_quantity > 0 ? 'pointer' : 'default',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            {p.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Cart Sidebar */}
            {showCart && (
                <div style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0,
                    width: '100%', maxWidth: '480px',
                    backgroundColor: 'white',
                    boxShadow: '-20px 0 50px rgba(0,0,0,0.15)',
                    zIndex: 2000,
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: '900' }}>Your Bag</h2>
                        <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: '#9ca3af' }}>×</button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛍️</div>
                                <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>Your bag is empty.</p>
                                <button
                                    onClick={() => setShowCart(false)}
                                    style={{ marginTop: '20px', color: '#3b82f6', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Go shopping →
                                </button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product.id} style={{ display: 'flex', gap: '20px', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ width: '100px', height: '100px', backgroundColor: '#f9fafb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                                        📦
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{item.product.name}</h4>
                                            <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Remove</button>
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: '0.95rem', margin: '8px 0' }}>Qty: {item.quantity}</div>
                                        <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>${(item.product.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: '40px', borderTop: '2px solid #111827', paddingTop: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '900', marginBottom: '30px' }}>
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            disabled={cart.length === 0}
                            onClick={() => router.push('/checkout')}
                            style={{
                                width: '100%',
                                backgroundColor: cart.length > 0 ? '#111827' : '#9ca3af',
                                color: 'white',
                                padding: '22px',
                                borderRadius: '20px',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '1.2rem',
                                cursor: cart.length > 0 ? 'pointer' : 'default',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                            }}
                        >
                            Check Out
                        </button>
                        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginTop: '20px' }}>
                            Taxes and shipping calculated at checkout.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { AppProvider, useApp } from '../../components/AppContext';

function CartContent() {
    const { cart, removeFromCart, updateCartQty, cartTotal, clearCart } = useApp();
    const router = useRouter();

    const tax = cartTotal * 0.1;
    const shipping = cart.length > 0 ? (cartTotal >= 50 ? 0 : 5.99) : 0;
    const grandTotal = cartTotal + tax + shipping;

    if (cart.length === 0) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '5rem' }}>🛍️</div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Your cart is empty</h2>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>Discover our products and add items you love.</p>
                <Link href="/products" style={{ padding: '14px 32px', backgroundColor: '#2563eb', color: 'white', borderRadius: '14px', textDecoration: 'none', fontWeight: '700', fontSize: '1rem' }}>Start Shopping</Link>
            </div>
            <Footer />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Navigation />
            <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '40px 20px', flex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '30px', color: '#111827' }}>Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cart.map(item => (
                            <div key={item.product.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f9fafb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.product.images?.[0] ? <img src={item.product.images[0].image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2.5rem', opacity: 0.2 }}>📦</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{item.product.name}</h3>
                                    <p style={{ color: '#2563eb', fontWeight: '700', fontSize: '1.1rem' }}>${item.product.price.toFixed(2)}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                                    <span style={{ fontSize: '1rem', fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                    <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem' }}>${(item.product.price * item.quantity).toFixed(2)}</div>
                                    <button onClick={() => removeFromCart(item.product.id)} style={{ marginTop: '8px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>Remove</button>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                            <Link href="/products" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>← Continue Shopping</Link>
                            <button onClick={clearCart} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Clear Cart</button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', border: '1px solid #e5e7eb', position: 'sticky', top: '80px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px', color: '#111827' }}>Order Summary</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontSize: '0.9rem' }}>
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontSize: '0.9rem' }}>
                                <span>Shipping</span>
                                <span>{shipping === 0 ? <span style={{ color: '#059669', fontWeight: '600' }}>Free</span> : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontSize: '0.9rem' }}>
                                <span>Tax (10%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            {shipping > 0 && (
                                <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#166534', textAlign: 'center' }}>
                                    Add ${(50 - cartTotal).toFixed(2)} more for free shipping 🚚
                                </div>
                            )}
                        </div>

                        <div style={{ borderTop: '2px solid #111827', paddingTop: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: '900' }}>
                            <span>Total</span>
                            <span>${grandTotal.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => router.push('/checkout')}
                            style={{ width: '100%', padding: '18px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                        >
                            Proceed to Checkout →
                        </button>

                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span>🔒</span> Secure, encrypted checkout
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function CartPage() {
    return <AppProvider><CartContent /></AppProvider>;
}

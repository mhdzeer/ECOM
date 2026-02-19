"use client";

import React from 'react';
import Link from 'next/link';

const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys'
];

export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#111827', color: '#d1d5db', marginTop: 'auto' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '16px' }}>
                            AlZain<span style={{ color: '#60a5fa' }}>Shop</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: '#9ca3af' }}>
                            Premium products curated for quality and style. Fast delivery across Bahrain and the Gulf.
                        </p>
                    </div>
                    <div>
                        <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '16px', fontSize: '0.95rem' }}>Shop</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/products" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>All Products</Link>
                            <Link href="/products?is_featured=true" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>Featured</Link>
                            <Link href="/wishlist" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>Wishlist</Link>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '16px', fontSize: '0.95rem' }}>Account</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/login" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>Sign In</Link>
                            <Link href="/register" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>Create Account</Link>
                            <Link href="/orders" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>My Orders</Link>
                            <Link href="/account" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>Profile</Link>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '16px', fontSize: '0.95rem' }}>Support</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <a href="mailto:support@alzain.shop" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>support@alzain.shop</a>
                            <a href="https://wa.me/97300000000" style={{ color: '#9ca3af', fontWeight: '400', fontSize: '0.875rem' }}>WhatsApp Support</a>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #374151', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>© 2026 AlZain E-commerce. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span style={{ fontSize: '1.5rem' }}>💳</span>
                        <span style={{ fontSize: '1.5rem' }}>🔒</span>
                        <span style={{ fontSize: '1.5rem' }}>🚀</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

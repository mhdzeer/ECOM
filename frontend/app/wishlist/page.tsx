"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { AppProvider, useApp } from '../../components/AppContext';
import { api } from '../../lib/api';

function WishlistContent() {
    const { wishlist, toggleWishlist, addToCart } = useApp();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (wishlist.length === 0) { setLoading(false); return; }
        Promise.all(wishlist.map(id => api.getProduct(id).catch(() => null)))
            .then(res => {
                setProducts(res.filter(Boolean));
                setLoading(false);
            });
    }, [wishlist.length]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />
            <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '40px 20px', flex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', color: '#111827' }}>❤️ My Wishlist</h1>
                <p style={{ color: '#6b7280', marginBottom: '32px' }}>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>
                ) : wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', backgroundColor: '#fef2f2', borderRadius: '24px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💔</div>
                        <h3 style={{ fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Your wishlist is empty</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Click the ❤️ on any product to save it here.</p>
                        <Link href="/products" style={{ padding: '14px 32px', backgroundColor: '#2563eb', color: 'white', borderRadius: '14px', textDecoration: 'none', fontWeight: '700' }}>Browse Products</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                        {products.map(p => (
                            <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'relative' }}>
                                    <Link href={`/products/${p.id}`}>
                                        <div style={{ height: '260px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {p.images?.[0] ? <img src={p.images[0].image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '4rem', opacity: 0.15 }}>📦</span>}
                                        </div>
                                    </Link>
                                    <button onClick={() => toggleWishlist(p.id)} style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' }}>❤️</button>
                                </div>
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link href={`/products/${p.id}`}><h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{p.name}</h3></Link>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#111827' }}>${p.price.toFixed(2)}</span>
                                        <button
                                            disabled={p.stock_quantity === 0}
                                            onClick={() => addToCart(p)}
                                            style={{ padding: '10px 18px', backgroundColor: p.stock_quantity > 0 ? '#2563eb' : '#d1d5db', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: p.stock_quantity > 0 ? 'pointer' : 'not-allowed', fontSize: '0.85rem' }}
                                        >
                                            {p.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default function WishlistPage() {
    return <AppProvider><WishlistContent /></AppProvider>;
}

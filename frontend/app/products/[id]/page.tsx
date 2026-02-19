"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import { AppProvider, useApp } from '../../../components/AppContext';
import { api } from '../../../lib/api';

function ProductDetailContent() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { addToCart, toggleWishlist, isInWishlist, toast } = useApp();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [related, setRelated] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;
        api.getProduct(parseInt(id)).then(p => {
            setProduct(p);
            setLoading(false);
            // Fetch related products from same category
            if (p.category_id) {
                api.getProducts({ category_id: p.category_id, page_size: 4 }).then(data => {
                    setRelated((data.products || []).filter((rp: any) => rp.id !== p.id).slice(0, 4));
                }).catch(() => { });
            }
        }).catch(() => { setLoading(false); });
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        </div>
    );

    if (!product) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Product not found.</p>
                <Link href="/products" style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '600' }}>Back to Shop</Link>
            </div>
        </div>
    );

    const primaryImage = product.images?.[selectedImage]?.image_url;
    const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : null;
    const inStock = product.stock_quantity > 0;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />

            <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '30px 20px' }}>
                {/* Breadcrumb */}
                <nav style={{ marginBottom: '30px', fontSize: '0.875rem', color: '#9ca3af', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link href="/" style={{ color: '#2563eb' }}>Home</Link> /
                    <Link href="/products" style={{ color: '#2563eb' }}>Products</Link> /
                    {product.category && <><Link href={`/products?category=${product.category_id}`} style={{ color: '#2563eb' }}>{product.category.name}</Link> /</>}
                    <span style={{ color: '#4b5563', fontWeight: '500' }}>{product.name}</span>
                </nav>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '60px' }}>
                    {/* Image Gallery */}
                    <div>
                        <div style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: '#f9fafb', marginBottom: '12px', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {primaryImage
                                ? <img src={primaryImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '5rem', opacity: 0.15 }}>📦</span>}
                        </div>
                        {product.images?.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {product.images.map((img: any, idx: number) => (
                                    <div key={idx} onClick={() => setSelectedImage(idx)} style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${selectedImage === idx ? '#2563eb' : 'transparent'}` }}>
                                        <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        {product.category && <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category.name}</span>}
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: '10px 0 16px', lineHeight: '1.2' }}>{product.name}</h1>

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827' }}>${product.price.toFixed(2)}</span>
                            {product.compare_price && (
                                <span style={{ fontSize: '1.25rem', color: '#9ca3af', textDecoration: 'line-through' }}>${product.compare_price.toFixed(2)}</span>
                            )}
                            {discount && <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '99px', fontWeight: '700', fontSize: '0.875rem' }}>-{discount}%</span>}
                        </div>

                        {/* Stock */}
                        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: inStock ? '#059669' : '#dc2626' }} />
                            <span style={{ fontWeight: '600', color: inStock ? '#059669' : '#dc2626', fontSize: '0.9rem' }}>
                                {inStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                            </span>
                        </div>

                        {/* Description */}
                        <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '30px' }}>{product.description}</p>

                        {/* SKU */}
                        {product.sku && <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '24px' }}>SKU: {product.sku}</p>}

                        {/* Quantity */}
                        {inStock && (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '10px', display: 'block', color: '#374151' }}>Quantity</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontWeight: '700', fontSize: '1.2rem', cursor: 'pointer' }}>−</button>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '700', width: '40px', textAlign: 'center' }}>{quantity}</span>
                                    <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))} style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontWeight: '700', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                disabled={!inStock}
                                onClick={() => { addToCart(product, quantity); router.push('/cart'); }}
                                style={{ flex: 1, minWidth: '160px', padding: '18px 24px', backgroundColor: inStock ? '#111827' : '#9ca3af', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: inStock ? 'pointer' : 'not-allowed' }}
                            >
                                {inStock ? 'Buy Now' : 'Out of Stock'}
                            </button>
                            <button
                                disabled={!inStock}
                                onClick={() => addToCart(product, quantity)}
                                style={{ flex: 1, minWidth: '160px', padding: '18px 24px', backgroundColor: 'white', color: inStock ? '#2563eb' : '#9ca3af', border: `2px solid ${inStock ? '#2563eb' : '#d1d5db'}`, borderRadius: '14px', fontWeight: '700', fontSize: '1rem', cursor: inStock ? 'pointer' : 'not-allowed' }}
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid #e5e7eb', backgroundColor: 'white', fontSize: '1.3rem', cursor: 'pointer' }}
                            >
                                {isInWishlist(product.id) ? '❤️' : '🤍'}
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div style={{ marginTop: '30px', padding: '16px 20px', backgroundColor: '#f9fafb', borderRadius: '14px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {['🚚 Free shipping $50+', '🔄 30-day returns', '🔒 Secure payment'].map(b => (
                                <span key={b} style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: '500' }}>{b}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>You may also like</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {related.map((p: any) => (
                                <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3f4f6', display: 'block' }}>
                                    <div style={{ height: '200px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {p.images?.[0] ? <img src={p.images[0].image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '3rem', opacity: 0.15 }}>📦</span>}
                                    </div>
                                    <div style={{ padding: '14px' }}>
                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem', marginBottom: '6px' }}>{p.name}</div>
                                        <div style={{ fontWeight: '800', color: '#2563eb' }}>${p.price.toFixed(2)}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default function ProductDetailPage() {
    return <AppProvider><ProductDetailContent /></AppProvider>;
}

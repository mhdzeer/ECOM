"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { AppProvider, useApp } from '../components/AppContext';
import { api } from '../lib/api';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    compare_price?: number;
    stock_quantity: number;
    is_featured: boolean;
    images: { image_url: string; is_primary: boolean }[];
    category?: { name: string };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

function ProductCard({ product }: { product: Product }) {
    const { addToCart, toggleWishlist, isInWishlist } = useApp();
    const inWishlist = isInWishlist(product.id);
    const image = product.images?.[0]?.image_url;
    const discount = product.compare_price
        ? Math.round((1 - product.price / product.compare_price) * 100)
        : null;

    return (
        <div style={{
            backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
            border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease', position: 'relative'
        }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
        >
            {/* Wishlist */}
            <button onClick={() => toggleWishlist(product.id)} style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 2,
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: inWishlist ? '#fef2f2' : 'rgba(255,255,255,0.9)',
                border: '1px solid ' + (inWishlist ? '#fecaca' : '#e5e7eb'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', cursor: 'pointer', backdropFilter: 'blur(4px)'
            }}>
                {inWishlist ? '❤️' : '🤍'}
            </button>

            {/* Badge */}
            {discount && <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, backgroundColor: '#dc2626', color: 'white', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '99px' }}>-{discount}%</div>}

            {/* Image */}
            <Link href={`/products/${product.id}`}>
                <div style={{ height: '280px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {image
                        ? <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '5rem', opacity: 0.15 }}>📦</span>}
                    {product.stock_quantity === 0 && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '2px' }}>SOLD OUT</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Details */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {product.category && (
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {product.category.name}
                    </span>
                )}
                <Link href={`/products/${product.id}`}>
                    <h3 style={{ margin: '6px 0 8px', fontSize: '1.05rem', fontWeight: '700', color: '#111827', lineHeight: '1.3' }}>
                        {product.name}
                    </h3>
                </Link>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 auto', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                </p>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#111827' }}>${product.price.toFixed(2)}</span>
                        {product.compare_price && <span style={{ fontSize: '0.9rem', color: '#9ca3af', textDecoration: 'line-through', marginLeft: '8px' }}>${product.compare_price.toFixed(2)}</span>}
                    </div>
                    <button
                        disabled={product.stock_quantity === 0}
                        onClick={() => addToCart(product)}
                        style={{
                            backgroundColor: product.stock_quantity > 0 ? '#2563eb' : '#d1d5db',
                            color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none',
                            fontWeight: '700', fontSize: '0.875rem', cursor: product.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                            transition: 'background-color 0.15s'
                        }}
                    >
                        {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function HomeContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [featured, setFeatured] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([
            api.getProducts({ page_size: 12 }),
            api.getProducts({ is_featured: true, page_size: 6 }),
            api.getCategories(),
        ]).then(([p, f, c]) => {
            setProducts(p.products || []);
            setFeatured(f.products || []);
            setCategories(c || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filteredProducts = products.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !selectedCategory || p.category?.name === categories.find(c => c.id === selectedCategory)?.name;
        return matchSearch && matchCat;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navigation />

            {/* Hero */}
            <section style={{
                padding: '80px 20px 100px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fef3c7 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />
                <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
                    <div style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '6px 20px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px' }}>
                        🎉 Free shipping on orders over $50
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '20px', letterSpacing: '-2px' }}>
                        Shop Premium.<br />
                        <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live Better.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '40px', lineHeight: '1.6' }}>
                        Curated products from around the world, delivered to your doorstep.
                    </p>
                    {/* Search Bar */}
                    <div style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ flex: 1, padding: '16px 20px', borderRadius: '16px', border: '2px solid #e5e7eb', fontSize: '1rem', outline: 'none', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        />
                        <Link href="/products" style={{ padding: '16px 28px', backgroundColor: '#2563eb', color: 'white', borderRadius: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>Browse All</Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section style={{ padding: '40px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '20px', color: '#111827' }}>Shop by Category</h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            style={{ padding: '10px 24px', borderRadius: '99px', border: '2px solid ' + (!selectedCategory ? '#2563eb' : '#e5e7eb'), backgroundColor: !selectedCategory ? '#eff6ff' : 'white', color: !selectedCategory ? '#2563eb' : '#4b5563', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.9rem' }}
                        >All Products</button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCategory(c.id)}
                                style={{ padding: '10px 24px', borderRadius: '99px', border: '2px solid ' + (selectedCategory === c.id ? '#2563eb' : '#e5e7eb'), backgroundColor: selectedCategory === c.id ? '#eff6ff' : 'white', color: selectedCategory === c.id ? '#2563eb' : '#4b5563', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.9rem' }}
                            >{c.name}</button>
                        ))}
                    </div>
                </section>
            )}

            {/* Products Grid */}
            <section style={{ padding: '0 20px 80px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>
                        {search ? `Results for "${search}"` : 'Featured Products'}
                    </h2>
                    <Link href="/products" style={{ color: '#2563eb', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>View all →</Link>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', backgroundColor: '#f9fafb', borderRadius: '20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                        <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>No products found.</p>
                        <button onClick={() => { setSearch(''); setSelectedCategory(null); }} style={{ marginTop: '16px', padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Clear filters</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </section>

            {/* Features */}
            <section style={{ backgroundColor: '#f9fafb', padding: '60px 20px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                    {[
                        { icon: '🚚', title: 'Free Delivery', desc: 'On orders above $50' },
                        { icon: '🔄', title: 'Easy Returns', desc: '30-day return policy' },
                        { icon: '🔒', title: 'Secure Payments', desc: 'SSL encrypted checkout' },
                        { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
                    ].map(f => (
                        <div key={f.title} style={{ textAlign: 'center', padding: '30px 20px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{f.icon}</div>
                            <h3 style={{ fontWeight: '700', marginBottom: '6px', color: '#111827' }}>{f.title}</h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default function Home() {
    return (
        <AppProvider>
            <HomeContent />
        </AppProvider>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { AppProvider, useApp } from '../../components/AppContext';
import { api } from '../../lib/api';

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
    category?: { name: string; id: number };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

function ProductsContent() {
    const { addToCart, toggleWishlist, isInWishlist } = useApp();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [featuredOnly, setFeaturedOnly] = useState(false);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory, search, minPrice, maxPrice, featuredOnly]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                page_size: 12,
                ...(selectedCategory && { category_id: selectedCategory }),
                ...(search && { search }),
                ...(minPrice && { min_price: parseFloat(minPrice) }),
                ...(maxPrice && { max_price: parseFloat(maxPrice) }),
                ...(featuredOnly && { is_featured: true }),
            };
            const data = await api.getProducts(params);
            setProducts(data.products || []);
            setTotal(data.total || 0);
            setTotalPages(data.total_pages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const resetFilters = () => {
        setSearch(''); setSelectedCategory(null);
        setMinPrice(''); setMaxPrice('');
        setFeaturedOnly(false); setPage(1);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />

            <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '40px 20px', flex: 1 }}>
                <div style={{ display: 'flex', gap: '30px' }}>

                    {/* Sidebar Filters */}
                    <aside style={{ width: '260px', flexShrink: 0, display: 'none' }} className="hide-mobile">
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', position: 'sticky', top: '80px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ fontWeight: '700', color: '#111827' }}>Filters</h3>
                                <button onClick={resetFilters} style={{ fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Clear all</button>
                            </div>

                            {/* Categories */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '12px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <button onClick={() => { setSelectedCategory(null); setPage(1); }}
                                        style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: !selectedCategory ? '#eff6ff' : 'transparent', color: !selectedCategory ? '#2563eb' : '#4b5563', fontWeight: !selectedCategory ? '600' : '400', fontSize: '0.9rem' }}
                                    >All Categories</button>
                                    {categories.map(c => (
                                        <button key={c.id} onClick={() => { setSelectedCategory(c.id); setPage(1); }}
                                            style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: selectedCategory === c.id ? '#eff6ff' : 'transparent', color: selectedCategory === c.id ? '#2563eb' : '#4b5563', fontWeight: selectedCategory === c.id ? '600' : '400', fontSize: '0.9rem' }}
                                        >{c.name}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '12px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</h4>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.875rem' }} />
                                    <input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.875rem' }} />
                                </div>
                                <button onClick={() => { setPage(1); fetchProducts(); }} style={{ marginTop: '10px', width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}>Apply</button>
                            </div>

                            {/* Featured */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={featuredOnly} onChange={e => { setFeaturedOnly(e.target.checked); setPage(1); }} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.9rem' }}>Featured only</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Search & Sort Bar */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '10px', minWidth: '200px' }}>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.9rem', outline: 'none' }}
                                />
                                <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Search</button>
                            </form>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.9rem', backgroundColor: 'white', cursor: 'pointer' }}>
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>

                        {/* Result count */}
                        <div style={{ marginBottom: '20px', color: '#6b7280', fontSize: '0.9rem' }}>
                            {loading ? 'Loading...' : `${total} products found`}
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>
                        ) : products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f9fafb', borderRadius: '20px' }}>
                                <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>No products found.</p>
                                <button onClick={resetFilters} style={{ marginTop: '16px', padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Clear filters</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    {products.map(p => (
                                        <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' }}>
                                            <Link href={`/products/${p.id}`}>
                                                <div style={{ height: '240px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                                    {p.images?.[0] ? <img src={p.images[0].image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '4rem', opacity: 0.15 }}>📦</span>}
                                                    {p.stock_quantity === 0 && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px' }}>SOLD OUT</span></div>}
                                                    {p.compare_price && <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc2626', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '3px 8px', borderRadius: '99px' }}>-{Math.round((1 - p.price / p.compare_price) * 100)}%</div>}
                                                </div>
                                            </Link>
                                            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {p.category && <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' }}>{p.category.name}</span>}
                                                <Link href={`/products/${p.id}`}><h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#111827', lineHeight: '1.3' }}>{p.name}</h3></Link>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                    <div>
                                                        <span style={{ fontWeight: '800', color: '#111827' }}>${p.price.toFixed(2)}</span>
                                                        {p.compare_price && <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: '#9ca3af', marginLeft: '6px' }}>${p.compare_price.toFixed(2)}</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => toggleWishlist(p.id)} style={{ width: '32px', height: '32px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                            {isInWishlist(p.id) ? '❤️' : '🤍'}
                                                        </button>
                                                        <button disabled={p.stock_quantity === 0} onClick={() => addToCart(p)} style={{ padding: '0 14px', height: '32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', opacity: p.stock_quantity === 0 ? 0.5 : 1 }}>
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontWeight: '600' }}>← Prev</button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                            <button key={p} onClick={() => setPage(p)} style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid ' + (page === p ? '#2563eb' : '#e5e7eb'), backgroundColor: page === p ? '#2563eb' : 'white', color: page === p ? 'white' : '#374151', cursor: 'pointer', fontWeight: '600' }}>{p}</button>
                                        ))}
                                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontWeight: '600' }}>Next →</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function ProductsPage() {
    return <AppProvider><ProductsContent /></AppProvider>;
}

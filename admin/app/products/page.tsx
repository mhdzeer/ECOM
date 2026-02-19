"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '../../components/AdminContext';
import Sidebar from '../../components/Sidebar';
import { adminApi } from '../../lib/api';

function ProductsContent() {
    const { token, toast } = useAdmin();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        name: '', slug: '', description: '', price: '', compare_price: '',
        stock_quantity: '0', sku: '', category_id: '', is_featured: false,
        is_active: true, image_url: ''
    });

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        fetchAll();
    }, [token]);

    const fetchAll = async () => {
        try {
            const [p, c] = await Promise.all([adminApi.getProducts(token!), adminApi.getCategories(token!)]);
            setProducts(p.products || []);
            setCategories(c || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditProduct(null);
        setForm({ name: '', slug: '', description: '', price: '', compare_price: '', stock_quantity: '0', sku: '', category_id: '', is_featured: false, is_active: true, image_url: '' });
        setShowModal(true);
    };

    const openEdit = (p: any) => {
        setEditProduct(p);
        setForm({
            name: p.name, slug: p.slug || '', description: p.description || '',
            price: String(p.price), compare_price: p.compare_price ? String(p.compare_price) : '',
            stock_quantity: String(p.stock_quantity), sku: p.sku || '',
            category_id: p.category_id ? String(p.category_id) : '',
            is_featured: p.is_featured, is_active: p.is_active,
            image_url: p.images?.[0]?.image_url || ''
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: any = {
                name: form.name,
                slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                description: form.description,
                price: parseFloat(form.price),
                stock_quantity: parseInt(form.stock_quantity),
                is_featured: form.is_featured,
                is_active: form.is_active,
                images: form.image_url ? [{ image_url: form.image_url, is_primary: true }] : [],
            };
            if (form.compare_price) payload.compare_price = parseFloat(form.compare_price);
            if (form.sku) payload.sku = form.sku;
            if (form.category_id) payload.category_id = parseInt(form.category_id);

            if (editProduct) {
                await adminApi.updateProduct(token!, editProduct.id, payload);
                toast('Product updated!', 'success');
            } else {
                await adminApi.createProduct(token!, payload);
                toast('Product created!', 'success');
            }
            setShowModal(false);
            fetchAll();
        } catch (err: any) {
            toast(err?.detail || 'Failed to save product', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await adminApi.deleteProduct(token!, id);
            toast('Product deleted', 'success');
            fetchAll();
        } catch (err: any) {
            toast(err?.detail || 'Failed to delete', 'error');
        }
    };

    const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#111827' }}>Products</h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>{products.length} products in catalog</p>
                    </div>
                    <button onClick={openCreate} style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
                        + Add Product
                    </button>
                </div>

                {/* Search */}
                <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '20px', width: '300px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }} />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>
                ) : (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#fafafa'}
                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {p.images?.[0] ? <img src={p.images[0].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>📦</span>}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#111827' }}>{p.name}</div>
                                                    {p.is_featured && <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: '600' }}>⭐ Featured</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#6b7280', fontFamily: 'monospace' }}>{p.sku || '—'}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#374151' }}>{p.category?.name || '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>${p.price.toFixed(2)}</div>
                                            {p.compare_price && <div style={{ fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through' }}>${p.compare_price.toFixed(2)}</div>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ fontWeight: '700', color: p.stock_quantity > 10 ? '#059669' : p.stock_quantity > 0 ? '#d97706' : '#dc2626' }}>
                                                {p.stock_quantity}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '4px' }}>units</span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: p.is_active ? '#f0fdf4' : '#fef2f2', color: p.is_active ? '#166534' : '#991b1b' }}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => router.push(`/admin/products/${p.id}/variants`)} style={{ padding: '6px 14px', backgroundColor: '#fdf4ff', color: '#9333ea', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>Variants</button>
                                                <button onClick={() => openEdit(p)} style={{ padding: '6px 14px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                                <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: '6px 14px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>No products found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', padding: '36px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                {[
                                    { key: 'name', label: 'Product Name *', span: 2 },
                                    { key: 'sku', label: 'SKU / Code', span: 1 },
                                    { key: 'category_id', label: 'Category', span: 1, type: 'select' },
                                    { key: 'price', label: 'Price ($) *', span: 1, type: 'number' },
                                    { key: 'compare_price', label: 'Compare Price ($)', span: 1, type: 'number' },
                                    { key: 'stock_quantity', label: 'Stock Quantity *', span: 1, type: 'number' },
                                    { key: 'image_url', label: 'Image URL', span: 2 },
                                    { key: 'description', label: 'Description', span: 2, type: 'textarea' },
                                ].map(({ key, label, span, type }) => (
                                    <div key={key} style={{ gridColumn: `span ${span}` }}>
                                        <label style={{ display: 'block', fontWeight: '600', fontSize: '0.8rem', color: '#374151', marginBottom: '6px' }}>{label}</label>
                                        {type === 'textarea' ? (
                                            <textarea value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', resize: 'vertical', minHeight: '80px', outline: 'none' }} />
                                        ) : type === 'select' ? (
                                            <select value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none', backgroundColor: 'white' }}>
                                                <option value="">No category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        ) : (
                                            <input type={type || 'text'} step={type === 'number' ? '0.01' : undefined} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    Featured product
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    Active (visible to customers)
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={saving} style={{ flex: 2, padding: '14px', backgroundColor: saving ? '#60a5fa' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: saving ? 'wait' : 'pointer' }}>
                                    {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminProducts() {
    return <AdminProvider><ProductsContent /></AdminProvider>;
}

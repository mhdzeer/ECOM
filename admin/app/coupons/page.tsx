"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '../../components/AdminContext';
import Sidebar from '../../components/Sidebar';
import { adminApi } from '../../lib/api';

function CouponsContent() {
    const { token } = useAdmin();
    const router = useRouter();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_purchase_amount: 0,
        max_discount_amount: null as number | null,
        usage_limit: null as number | null,
        expires_at: '',
        is_active: true
    });

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        fetchCoupons();
    }, [token]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getCoupons(token!);
            setCoupons(data);
        } catch (err) { }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminApi.createCoupon(token!, {
                ...form,
                expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null
            });
            setShowForm(false);
            fetchCoupons();
        } catch (err) { }
    };

    const handleDelete = async (code: string) => {
        if (!confirm(`Delete coupon ${code}?`)) return;
        try {
            await adminApi.deleteCoupon(token!, code);
            fetchCoupons();
        } catch (err) { }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#111827' }}>Coupons & Promotions</h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Create and manage discount codes.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                        {showForm ? 'Cancel' : '+ New Coupon'}
                    </button>
                </div>

                {showForm && (
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '20px', border: '2px solid #2563eb', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Create New Coupon</h2>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>COUPON CODE</label>
                                <input required placeholder="SUMMER25" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>DISCOUNT TYPE</label>
                                <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed_amount">Fixed Amount ($)</option>
                                    <option value="free_shipping">Free Shipping</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>VALUE</label>
                                <input type="number" step="0.01" required value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>MIN PURCHASE ($)</label>
                                <input type="number" step="0.01" value={form.min_purchase_amount} onChange={e => setForm({ ...form, min_purchase_amount: parseFloat(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>EXPIRY DATE</label>
                                <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>USAGE LIMIT</label>
                                <input type="number" placeholder="Unlimited" value={form.usage_limit || ''} onChange={e => setForm({ ...form, usage_limit: e.target.value ? parseInt(e.target.value) : null })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
                            </div>
                            <button type="submit" style={{ gridColumn: 'span 3', padding: '16px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>Create Coupon</button>
                        </form>
                    </div>
                )}

                <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '80px', textAlign: 'center' }}><div className="spinner" /></div>
                    ) : coupons.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#6b7280' }}>No coupons created yet.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                                    {['Code', 'Type', 'Value', 'Min Purchase', 'Expiry', 'Usage', 'Status', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                        <td style={{ padding: '20px', fontSize: '0.875rem', fontWeight: '900', color: '#111827' }}>{c.code}</td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem', textTransform: 'capitalize' }}>{c.discount_type.replace('_', ' ')}</td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem', fontWeight: '700' }}>
                                            {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem' }}>${c.min_purchase_amount}</td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem', color: '#6b7280' }}>
                                            {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem' }}>
                                            {c.used_count} / {c.usage_limit || '∞'}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: c.is_active ? '#f0fdf4' : '#fef2f2', color: c.is_active ? '#166534' : '#991b1b' }}>
                                                {c.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <button onClick={() => handleDelete(c.code)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function AdminCouponsPage() {
    return <AdminProvider><CouponsContent /></AdminProvider>;
}

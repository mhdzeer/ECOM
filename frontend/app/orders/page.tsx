"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { AppProvider, useApp } from '../../components/AppContext';
import { api } from '../../lib/api';

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
    processing: { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6' },
    shipped: { bg: '#f5f3ff', text: '#5b21b6', dot: '#8b5cf6' },
    delivered: { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
    cancelled: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
};

function OrdersContent() {
    const { token, user } = useApp();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        if (!token) { router.push('/login'); return; }
        api.getOrders(token).then(data => {
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [token]);

    const steps = ['pending', 'processing', 'shipped', 'delivered'];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Navigation />
            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '40px 20px', flex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', color: '#111827' }}>My Orders</h1>
                <p style={{ color: '#6b7280', marginBottom: '32px' }}>Welcome, {user?.full_name || user?.username}. Track all your orders here.</p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📦</div>
                        <h3 style={{ fontWeight: '700', color: '#111827', marginBottom: '8px' }}>No orders yet</h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Discover our products and place your first order.</p>
                        <Link href="/" style={{ padding: '14px 32px', backgroundColor: '#2563eb', color: 'white', borderRadius: '14px', textDecoration: 'none', fontWeight: '700' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orders.map(order => {
                            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                            const isOpen = expanded === order.id;
                            const stepIdx = steps.indexOf(order.status);

                            return (
                                <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    {/* Header */}
                                    <div
                                        onClick={() => setExpanded(isOpen ? null : order.id)}
                                        style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '2px' }}>ORDER NUMBER</div>
                                                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#111827' }}>{order.order_number}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '2px' }}>DATE</div>
                                                <div style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '2px' }}>TOTAL</div>
                                                <div style={{ fontWeight: '800', color: '#111827' }}>${order.total.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ backgroundColor: sc.bg, color: sc.text, padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: sc.dot, marginRight: '6px', verticalAlign: 'middle' }} />
                                                {order.status}
                                            </span>
                                            <span style={{ color: '#9ca3af', fontSize: '1.2rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                                        </div>
                                    </div>

                                    {/* Expanded */}
                                    {isOpen && (
                                        <div style={{ borderTop: '1px solid #f3f4f6', padding: '28px' }}>
                                            {/* Progress tracker */}
                                            {order.status !== 'cancelled' && (
                                                <div style={{ marginBottom: '28px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                                        {steps.map((s, i) => (
                                                            <React.Fragment key={s}>
                                                                <div style={{ flex: i < steps.length - 1 ? 'none' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: i <= stepIdx ? '#2563eb' : '#e5e7eb', color: i <= stepIdx ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' }}>
                                                                        {i < stepIdx ? '✓' : i + 1}
                                                                    </div>
                                                                    <span style={{ fontSize: '0.7rem', fontWeight: i === stepIdx ? '700' : '400', color: i <= stepIdx ? '#2563eb' : '#9ca3af', marginTop: '6px', textTransform: 'capitalize' }}>{s}</span>
                                                                </div>
                                                                {i < steps.length - 1 && <div style={{ flex: 1, height: '2px', backgroundColor: i < stepIdx ? '#2563eb' : '#e5e7eb', minWidth: '20px' }} />}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                {/* Items */}
                                                <div>
                                                    <h4 style={{ fontWeight: '700', fontSize: '0.85rem', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items Ordered</h4>
                                                    {order.items?.map((item: any) => (
                                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                                            <span style={{ color: '#4b5563' }}>{item.product_name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span></span>
                                                            <span style={{ fontWeight: '600' }}>${item.total.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Shipping */}
                                                <div>
                                                    <h4 style={{ fontWeight: '700', fontSize: '0.85rem', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipping Details</h4>
                                                    <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.6' }}>{order.shipping_address}</p>
                                                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: '4px' }}>📞 {order.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default function OrdersPage() {
    return <AppProvider><OrdersContent /></AppProvider>;
}

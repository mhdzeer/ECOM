"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '../components/AdminContext';
import Sidebar from '../components/Sidebar';
import { adminApi } from '../lib/api';

const statColors = [
    { bg: '#eff6ff', text: '#1d4ed8', accent: '#2563eb' },
    { bg: '#f0fdf4', text: '#166534', accent: '#059669' },
    { bg: '#fff7ed', text: '#9a3412', accent: '#ea580c' },
    { bg: '#fdf4ff', text: '#581c87', accent: '#9333ea' },
];

function DashboardContent() {
    const { user, token } = useAdmin();
    const router = useRouter();
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        Promise.all([
            adminApi.getProducts(token),
            adminApi.getAllOrders(token),
            adminApi.getOrderStats(token),
        ]).then(([products, orders, orderStats]) => {
            const productCount = products?.total || (products?.products?.length ?? 0);
            setStats({
                products: productCount,
                orders: orderStats?.total || orders?.length || 0,
                revenue: orderStats?.revenue || 0,
                pending: orderStats?.pending || 0,
            });
            setRecentOrders((Array.isArray(orders) ? orders : []).slice(0, 8));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [token]);

    const statCards = [
        { label: 'Products', value: stats.products, icon: '📦', desc: 'In catalog' },
        { label: 'Total Orders', value: stats.orders, icon: '🛒', desc: 'All time' },
        { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: '💰', desc: 'From delivered orders' },
        { label: 'Pending Orders', value: stats.pending, icon: '⏳', desc: 'Awaiting action' },
    ];

    const statusColors: Record<string, string> = {
        pending: '#f97316', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444'
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#111827' }}>Dashboard</h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Welcome back, {user?.full_name}. Here's what's happening.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <a href={`http://${typeof window !== 'undefined' ? window.location.hostname : ''}:39100`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 18px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            🔗 View Store
                        </a>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>
                ) : (
                    <>
                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            {statCards.map((card, idx) => (
                                <div key={card.label} className="fade-in" style={{ backgroundColor: statColors[idx].bg, borderRadius: '16px', padding: '24px', border: '1px solid' + statColors[idx].bg }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '1.75rem' }}>{card.icon}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: statColors[idx].text, backgroundColor: 'white', padding: '3px 10px', borderRadius: '99px' }}>{card.desc}</span>
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#111827' }}>{card.value}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders */}
                        <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' }}>
                            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>Recent Orders</h2>
                                <a href="/admin/orders" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '600' }}>View all →</a>
                            </div>
                            {recentOrders.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No orders yet</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                {['Order #', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map(order => (
                                                <tr key={order.id} style={{ borderBottom: '1px solid #f9fafb' }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb'}
                                                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''}
                                                >
                                                    <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '0.875rem' }}>{order.order_number}</td>
                                                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                                                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#374151' }}>{order.items?.length} items</td>
                                                    <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '0.9rem' }}>${order.total.toFixed(2)}</td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: statusColors[order.status] + '20', color: statusColors[order.status] }}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <a href="/admin/orders" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600' }}>Manage →</a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            {[
                                { href: '/admin/products', icon: '📦', title: 'Add Product', desc: 'Add new items to catalog', color: '#eff6ff' },
                                { href: '/admin/categories', icon: '🏷️', title: 'Manage Categories', desc: 'Organize product catalog', color: '#f0fdf4' },
                                { href: '/admin/orders', icon: '🛒', title: 'Process Orders', desc: 'Update order statuses', color: '#fff7ed' },
                            ].map(link => (
                                <a key={link.href} href={link.href} style={{ backgroundColor: link.color, borderRadius: '16px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'center', border: '1px solid transparent', transition: 'box-shadow 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'}
                                >
                                    <span style={{ fontSize: '1.75rem' }}>{link.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{link.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{link.desc}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default function AdminDashboard() {
    return <AdminProvider><DashboardContent /></AdminProvider>;
}

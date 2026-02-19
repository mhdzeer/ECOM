"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '../../components/AdminContext';
import Sidebar from '../../components/Sidebar';
import { adminApi } from '../../lib/api';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
    pending: '#f97316', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444'
};

function OrdersContent() {
    const { token } = useAdmin();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        fetchOrders();
    }, [token]);

    useEffect(() => {
        let result = orders;
        if (filterStatus !== 'all') result = result.filter(o => o.status === filterStatus);
        if (search) result = result.filter(o => o.order_number.toLowerCase().includes(search.toLowerCase()) || o.shipping_address?.toLowerCase().includes(search.toLowerCase()));
        setFiltered(result);
    }, [orders, filterStatus, search]);

    const fetchOrders = async () => {
        try {
            const data = await adminApi.getAllOrders(token!);
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: number, status: string) => {
        setUpdating(orderId);
        try {
            await adminApi.updateOrderStatus(token!, orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (e: any) {
            alert(e?.detail || 'Failed to update');
        } finally {
            setUpdating(null);
        }
    };

    const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {} as Record<string, number>);
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((a, o) => a + o.total, 0);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#111827' }}>Order Management</h1>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>{orders.length} total orders · ${totalRevenue.toFixed(2)} revenue from delivered</p>
                </div>

                {/* Status pills */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button onClick={() => setFilterStatus('all')} style={{ padding: '8px 16px', borderRadius: '99px', border: '2px solid ' + (filterStatus === 'all' ? '#2563eb' : '#e5e7eb'), backgroundColor: filterStatus === 'all' ? '#eff6ff' : 'white', color: filterStatus === 'all' ? '#2563eb' : '#4b5563', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                        All ({orders.length})
                    </button>
                    {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '8px 16px', borderRadius: '99px', border: '2px solid ' + (filterStatus === s ? STATUS_COLORS[s] : '#e5e7eb'), backgroundColor: filterStatus === s ? STATUS_COLORS[s] + '15' : 'white', color: filterStatus === s ? STATUS_COLORS[s] : '#4b5563', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                            {s} ({counts[s] || 0})
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text" placeholder="Search by order # or address..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '320px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }}
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" /></div>
                ) : (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>No orders found</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        {['', 'Order #', 'Date', 'Customer', 'Items', 'Total', 'Status', 'Update Status'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(order => (
                                        <React.Fragment key={order.id}>
                                            <tr style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                                                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#fafafa'}
                                                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = ''}
                                            >
                                                <td style={{ padding: '14px 16px' }}>
                                                    <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#6b7280' }}>
                                                        {expanded === order.id ? '▾' : '▸'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontWeight: '700', fontSize: '0.875rem' }}>{order.order_number}</td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#374151', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.shipping_address?.split(',')[0]}</td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#374151' }}>{order.items?.length} items</td>
                                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>${order.total.toFixed(2)}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: STATUS_COLORS[order.status] + '18', color: STATUS_COLORS[order.status], textTransform: 'capitalize' }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <select
                                                        value={order.status}
                                                        disabled={updating === order.id}
                                                        onChange={e => updateStatus(order.id, e.target.value)}
                                                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: 'white', outline: 'none' }}
                                                    >
                                                        {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                                                    </select>
                                                </td>
                                            </tr>
                                            {expanded === order.id && (
                                                <tr>
                                                    <td colSpan={8} style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.875rem' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Items</div>
                                                                {order.items?.map((item: any) => (
                                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#4b5563' }}>
                                                                        <span>{item.product_name} ×{item.quantity}</span>
                                                                        <span style={{ fontWeight: '600' }}>${item.total.toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Total</span><span>${order.total.toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '700', marginBottom: '8px', color: '#374151' }}>Shipping Details</div>
                                                                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{order.shipping_address}</p>
                                                                {order.phone && <p style={{ color: '#4b5563', marginTop: '4px' }}>📞 {order.phone}</p>}
                                                                {order.notes && <p style={{ color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>Note: {order.notes}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AdminOrders() {
    return <AdminProvider><OrdersContent /></AdminProvider>;
}

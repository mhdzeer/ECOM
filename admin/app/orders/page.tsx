"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: number;
    order_number: string;
    user_id: number;
    status: string;
    total: number;
    shipping_address: string;
    phone: string;
    created_at: string;
    items: OrderItem[];
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';
    const apiUrl = `http://${domain}:39101/api/orders`;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // In a full system, we'd fetch all orders (admin view). 
            // Current order_service route / gets user orders. We'll assume admin can see all for now or add an admin route later.
            const response = await axios.get(`${apiUrl}/`);
            setOrders(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: number, status: string) => {
        try {
            await axios.put(`${apiUrl}/${orderId}/status?status=${status}`);
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '30px' }}>🛒 Order Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 1fr' : '1fr', gap: '30px' }}>
                {/* Orders List */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '16px 24px', color: '#6b7280' }}>Order #</th>
                                <th style={{ padding: '16px 24px', color: '#6b7280' }}>Status</th>
                                <th style={{ padding: '16px 24px', color: '#6b7280' }}>Total</th>
                                <th style={{ padding: '16px 24px', color: '#6b7280' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>No orders found.</td></tr>
                            ) : (
                                orders.map((o) => (
                                    <tr
                                        key={o.id}
                                        onClick={() => setSelectedOrder(o)}
                                        style={{
                                            borderBottom: '1px solid #f3f4f6',
                                            cursor: 'pointer',
                                            backgroundColor: selectedOrder?.id === o.id ? '#f0f9ff' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '16px 24px', fontWeight: '600' }}>{o.order_number}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700',
                                                backgroundColor: o.status === 'delivered' ? '#f0fdf4' : o.status === 'processing' ? '#eff6ff' : '#fff7ed',
                                                color: o.status === 'delivered' ? '#166534' : o.status === 'processing' ? '#1e40af' : '#9a3412',
                                            }}>
                                                {o.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: '700' }}>${o.total.toFixed(2)}</td>
                                        <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '0.85rem' }}>
                                            {new Date(o.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Order Details Panel */}
                {selectedOrder && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Details: {selectedOrder.order_number}</h2>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '8px' }}>CHANGE STATUS</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(selectedOrder.id, s)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                                            border: selectedOrder.status === s ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                            backgroundColor: selectedOrder.status === s ? '#eff6ff' : 'white',
                                            fontWeight: selectedOrder.status === s ? '700' : '400'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Items</h3>
                            {selectedOrder.items.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                    <span>{item.product_name} x {item.quantity}</span>
                                    <span style={{ fontWeight: '600' }}>${item.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                            <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0' }}>Shipping Info</h3>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {selectedOrder.phone}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

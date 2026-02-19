"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

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
    status: string;
    total: number;
    created_at: string;
    items: OrderItem[];
}

export default function CustomerOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';
    const apiUrl = `http://${domain}:39101/api/orders`;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Mocking auth for now
            const mockToken = "Bearer mock-token";
            const response = await axios.get(apiUrl, {
                headers: { 'Authorization': mockToken }
            });
            setOrders(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '60px 5%', minHeight: '100vh', backgroundColor: '#fdfdfd', fontFamily: 'system-ui' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>My Orders</h1>
                    <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>← Back to Shop</Link>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '100px', color: '#6b7280' }}>Fetching your order history...</p>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #eee' }}>
                        <p style={{ fontSize: '1.25rem', color: '#6b7280', margin: 0 }}>You haven't placed any orders yet.</p>
                        <Link href="/" style={{ display: 'inline-block', marginTop: '20px', backgroundColor: '#111827', color: 'white', padding: '12px 30px', borderRadius: '12px', textDecoration: 'none' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {orders.map((o) => (
                            <div key={o.id} style={{
                                backgroundColor: 'white', padding: '30px', borderRadius: '24px',
                                border: '1px solid #eee', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Number</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{o.order_number}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800',
                                            backgroundColor: o.status === 'delivered' ? '#f0fdf4' : o.status === 'cancelled' ? '#fef2f2' : '#eff6ff',
                                            color: o.status === 'delivered' ? '#166534' : o.status === 'cancelled' ? '#991b1b' : '#1e40af',
                                        }}>
                                            {o.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                                    {o.items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                            <span style={{ color: '#374151' }}>{item.product_name} <span style={{ color: '#9ca3af' }}>x{item.quantity}</span></span>
                                            <span style={{ fontWeight: '600' }}>${item.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
                                    <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Ordered on {new Date(o.created_at).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>Total: ${o.total.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

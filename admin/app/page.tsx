"use client";

import React from 'react';

export default function AdminHome() {
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';

    const stats = [
        { label: 'Total Products', value: '24', icon: '📦', trend: '+4 this week', color: '#4f46e5' },
        { label: 'Total Orders', value: '156', icon: '🛒', trend: '+12% from last month', color: '#059669' },
        { label: 'Active Users', value: '1,240', icon: '👥', trend: '+85 new today', color: '#0891b2' },
        { label: 'Total Revenue', value: '$12,450', icon: '💰', trend: '+15.2%', color: '#d97706' },
    ];

    const managementLinks = [
        { name: '📦 Product Management', path: '/api/products/docs', color: '#4f46e5' },
        { name: '🔐 User & Security', path: '/api/auth/docs', color: '#0891b2' },
        { name: '🛒 Order Tracking', path: '/api/orders/docs', color: '#059669' },
        { name: '🚚 Delivery Management', path: '/api/delivery/docs', color: '#d97706' },
        { name: '💳 Payment Systems', path: '/api/payment/docs', color: '#dc2626' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: '#111827' }}>📊 Dashboard Overview</h1>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>Welcome back, Admin. Here is what's happening today.</p>
            </header>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '50px'
            }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f3f4f6'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                            <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '600', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '99px' }}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</h3>
                        <p style={{ margin: '8px 0 0', color: '#111827', fontSize: '1.75rem', fontWeight: '700' }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>🛠️ Service Management (API Docs)</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {managementLinks.map((link) => (
                    <a
                        key={link.path}
                        href={`http://${domain}:39101${link.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'none',
                            padding: '24px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: '1px solid #f3f4f6',
                            display: 'block'
                        }}
                    >
                        <h3 style={{ fontSize: '1.1rem', color: link.color, marginBottom: '12px', margin: 0 }}>{link.name}</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px' }}>
                            Access direct API controls to manage these services.
                        </p>
                        <div style={{ fontWeight: '600', color: link.color, fontSize: '0.875rem' }}>
                            Open Documentation →
                        </div>
                    </a>
                ))}
            </div>
        </div>
    )
}

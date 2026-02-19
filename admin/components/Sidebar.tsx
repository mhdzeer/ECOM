"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'Products', path: '/products', icon: '📦' },
        { name: 'Categories', path: '/categories', icon: '📁' },
        { name: 'Orders', path: '/orders', icon: '🛒' },
        { name: 'Customers', path: '/customers', icon: '👥' },
        { name: 'Settings', path: '/settings', icon: '⚙️' },
    ];

    return (
        <div style={{
            width: '280px',
            backgroundColor: '#ffffff',
            color: '#111827',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e5e7eb',
            zIndex: 1000
        }}>
            <div style={{
                padding: '30px 24px',
                fontSize: '1.25rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#3b82f6'
            }}>
                <div style={{
                    width: '35px',
                    height: '35px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem'
                }}>AZ</div>
                <span>ALZAIN.ADMIN</span>
            </div>

            <nav style={{ padding: '20px 16px', flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', paddingLeft: '12px' }}>
                    Main Menu
                </p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                marginBottom: '6px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? '#3b82f6' : '#4b5563',
                                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontWeight: isActive ? '700' : '500',
                                fontSize: '0.95rem'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div style={{
                margin: '20px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '16px',
                border: '1px solid #f3f4f6'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AD</div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Admin User</div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>owner@alzain.com</div>
                    </div>
                </div>
                <button style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#ef4444',
                    backgroundColor: 'white',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>Sign Out</button>
            </div>
        </div>
    );
};

export default Sidebar;

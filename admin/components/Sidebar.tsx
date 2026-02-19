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
            width: '260px',
            backgroundColor: '#1f2937',
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
            zIndex: 1000
        }}>
            <div style={{
                padding: '30px 24px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid #374151'
            }}>
                <span style={{ fontSize: '2rem' }}>💎</span>
                <span>AlZain Admin</span>
            </div>

            <nav style={{ padding: '20px 12px', flex: 1 }}>
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
                                padding: '12px 16px',
                                marginBottom: '4px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : '#9ca3af',
                                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                                transition: 'all 0.2s ease',
                                fontWeight: isActive ? '600' : '400'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div style={{
                padding: '20px',
                borderTop: '1px solid #374151',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#9ca3af',
                fontSize: '0.9rem'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                }}>A</div>
                <span>Admin User</span>
            </div>
        </div>
    );
};

export default Sidebar;

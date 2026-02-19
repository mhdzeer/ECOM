"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from './AdminContext';

const navSections = [
    {
        label: 'Overview',
        items: [
            { href: '/admin', icon: '📊', label: 'Dashboard' },
        ]
    },
    {
        label: 'Store Management',
        items: [
            { href: '/admin/products', icon: '📦', label: 'Products' },
            { href: '/admin/categories', icon: '🏷️', label: 'Categories' },
            { href: '/admin/orders', icon: '🛒', label: 'Orders' },
        ]
    },
    {
        label: 'Platform',
        items: [
            { href: '/admin/users', icon: '👥', label: 'Customers' },
            { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
        ]
    }
];

export default function Sidebar() {
    const { user, logout } = useAdmin();
    const pathname = usePathname();

    return (
        <aside style={{
            width: '240px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
            backgroundColor: '#111827', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '0.85rem' }}>AZ</div>
                    <div>
                        <div style={{ color: 'white', fontWeight: '800', fontSize: '0.95rem' }}>AlZain Admin</div>
                        <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Control Panel</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {navSections.map(section => (
                    <div key={section.label}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px', marginBottom: '6px' }}>
                            {section.label}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {section.items.map(item => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                return (
                                    <Link key={item.href} href={item.href} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 12px', borderRadius: '10px', fontSize: '0.875rem',
                                        backgroundColor: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                                        color: isActive ? '#60a5fa' : '#9ca3af',
                                        fontWeight: isActive ? '700' : '400',
                                        transition: 'all 0.15s',
                                    }}
                                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; }}
                                    >
                                        <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                                        {item.label}
                                        {isActive && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User footer */}
            {user && (
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0 }}>
                            {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name || user.email}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Administrator</div>
                        </div>
                        <button onClick={logout} title="Sign out" style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>↩</button>
                    </div>
                </div>
            )}
        </aside>
    );
}

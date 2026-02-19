"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './AppContext';

export default function Navigation() {
    const { cartCount, user, logout } = useApp();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartDrawer, setCartDrawer] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Shop' },
        { href: '/products', label: 'All Products' },
        { href: '/orders', label: 'My Orders' },
        { href: '/wishlist', label: '❤ Wishlist' },
    ];

    return (
        <>
            <header style={{
                position: 'sticky', top: 0, zIndex: 900,
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: '900', fontSize: '0.85rem'
                        }}>AZ</div>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>AlZain<span style={{ color: '#2563eb' }}>Shop</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hide-mobile" style={{ display: 'flex', gap: '4px' }}>
                        {navLinks.map(l => (
                            <Link key={l.href} href={l.href} style={{
                                padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '500',
                                color: pathname === l.href ? '#2563eb' : '#4b5563',
                                backgroundColor: pathname === l.href ? '#eff6ff' : 'transparent',
                                transition: 'all 0.15s'
                            }}>{l.label}</Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Search */}
                        <Link href="/products" style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.875rem' }}>
                            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                            <span className="hide-mobile">Search...</span>
                        </Link>

                        {/* Cart Button */}
                        <Link href="/cart" style={{ position: 'relative', padding: '8px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', color: '#374151', textDecoration: 'none' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                            {cartCount > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Account */}
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Link href="/account" style={{ textDecoration: 'none', width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                                </Link>
                            </div>
                        ) : (
                            <Link href="/login" style={{ padding: '8px 20px', borderRadius: '10px', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Hamburger */}
                        <button className="hide-desktop" onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', padding: '8px' }}>
                            <div style={{ width: '20px', height: '2px', backgroundColor: '#374151', marginBottom: '4px' }} />
                            <div style={{ width: '20px', height: '2px', backgroundColor: '#374151', marginBottom: '4px' }} />
                            <div style={{ width: '20px', height: '2px', backgroundColor: '#374151' }} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'white', padding: '20px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>AlZainShop</span>
                        <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', color: '#6b7280' }}>×</button>
                    </div>
                    {navLinks.map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px', fontSize: '1.1rem', fontWeight: '500', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>
                            {l.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <Link href="/account" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px', fontSize: '1.1rem', borderBottom: '1px solid #f3f4f6', color: '#111827' }}>My Account</Link>
                            <button onClick={() => { logout(); setMobileOpen(false); }} style={{ width: '100%', marginTop: '20px', padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '1rem' }}>Sign Out</button>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setMobileOpen(false)} style={{ display: 'block', marginTop: '20px', textAlign: 'center', padding: '16px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', fontWeight: '700', fontSize: '1.1rem' }}>Sign In / Register</Link>
                    )}
                </div>
            )}
        </>
    );
}

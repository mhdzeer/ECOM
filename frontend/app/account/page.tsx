"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { AppProvider, useApp } from '../../components/AppContext';
import { api } from '../../lib/api';

function AccountContent() {
    const { user, token, logout, toast } = useApp();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [tab, setTab] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');

    // Address Form
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [addrForm, setAddrForm] = useState({
        address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'Bahrain', is_default: false
    });

    // Password Form
    const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '', confirm: '' });
    const [pwdLoading, setPwdLoading] = useState(false);

    useEffect(() => {
        if (!token) { router.push('/login'); return; }
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const [ordersData, addressesData] = await Promise.all([
                api.getOrders(token!),
                api.getAddresses(token!)
            ]);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setAddresses(Array.isArray(addressesData) ? addressesData : []);
        } catch (err) { }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addAddress(token!, addrForm);
            toast("Address added!", "success");
            setShowAddrForm(false);
            setAddrForm({ address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'Bahrain', is_default: false });
            fetchData();
        } catch (err: any) {
            toast(err.detail || "Failed to add address", "error");
        }
    };

    const handleDeleteAddress = async (id: number) => {
        try {
            await api.deleteAddress(token!, id);
            toast("Address removed", "success");
            fetchData();
        } catch (err: any) {
            toast("Failed to remove address", "error");
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwdForm.new_password !== pwdForm.confirm) { toast('Passwords do not match', 'error'); return; }
        setPwdLoading(true);
        try {
            const res = await fetch(`http://${window.location.hostname}:39101/api/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ old_password: pwdForm.old_password, new_password: pwdForm.new_password }),
            });
            if (!res.ok) throw await res.json();
            toast('Password changed successfully!', 'success');
            setPwdForm({ old_password: '', new_password: '', confirm: '' });
        } catch (err: any) {
            toast(err?.detail || 'Failed to change password', 'error');
        } finally {
            setPwdLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Navigation />
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '40px 20px', flex: 1 }}>
                {/* Profile header */}
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: '900' }}>
                            {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: 0 }}>{user.full_name || user.username}</h1>
                            <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '0.9rem' }}>{user.email}</p>
                            {user.role === 'admin' && <span style={{ display: 'inline-block', marginTop: '6px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700' }}>Admin</span>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', padding: '16px 24px', backgroundColor: '#f9fafb', borderRadius: '14px' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#111827' }}>{orders.length}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Orders</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px 24px', backgroundColor: '#f9fafb', borderRadius: '14px' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#059669' }}>${orders.reduce((a: number, o: any) => a + o.total, 0).toFixed(0)}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Spent</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: 'white', padding: '6px', borderRadius: '14px', border: '1px solid #e5e7eb', width: 'fit-content', flexWrap: 'wrap' }}>
                    {(['overview', 'orders', 'addresses', 'settings'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: tab === t ? '#2563eb' : 'transparent', color: tab === t ? 'white' : '#4b5563', fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.875rem' }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {tab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {[
                            { icon: '📦', label: 'Total Orders', value: orders.length, color: '#eff6ff', link: '/orders' },
                            { icon: '🚚', label: 'Awaiting Delivery', value: orders.filter((o: any) => ['pending', 'processing', 'shipped'].includes(o.status)).length, color: '#fff7ed', link: '/orders' },
                            { icon: '📍', label: 'Stored Addresses', value: addresses.length, color: '#f0fdf4', link: '#' },
                            { icon: '❤️', label: 'Wishlist Items', value: 0, color: '#fef2f2', link: '/wishlist' },
                        ].map(card => (
                            <div key={card.label} onClick={() => card.link === '#' && setTab('addresses')} style={{ cursor: card.link === '#' ? 'pointer' : 'default', textDecoration: 'none', backgroundColor: card.color, borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '6px' }}>{card.label}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#111827' }}>{card.value}</div>
                                </div>
                                <span style={{ fontSize: '2rem' }}>{card.icon}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Orders */}
                {tab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                                <p style={{ color: '#6b7280' }}>No orders yet. <Link href="/" style={{ color: '#2563eb', fontWeight: '600' }}>Start shopping</Link></p>
                            </div>
                        ) : orders.map((o: any) => (
                            <div key={o.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: '800', color: '#111827' }}>{o.order_number}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items?.length} items</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontWeight: '800', color: '#111827' }}>${o.total.toFixed(2)}</span>
                                    <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#eff6ff', color: '#1e40af', textTransform: 'capitalize' }}>{o.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Addresses */}
                {tab === 'addresses' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontWeight: '800', margin: 0 }}>My Addresses</h3>
                            <button onClick={() => setShowAddrForm(!showAddrForm)} style={{ padding: '8px 16px', backgroundColor: '#111827', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                                {showAddrForm ? 'Cancel' : '+ Add New'}
                            </button>
                        </div>

                        {showAddrForm && (
                            <form onSubmit={handleAddAddress} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '2px solid #2563eb', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px' }}>Address Line 1</label>
                                    <input required value={addrForm.address_line1} onChange={e => setAddrForm({ ...addrForm, address_line1: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px' }}>Address Line 2 (Optional)</label>
                                    <input value={addrForm.address_line2} onChange={e => setAddrForm({ ...addrForm, address_line2: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px' }}>City</label>
                                    <input required value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px' }}>Country</label>
                                    <input required value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </div>
                                <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '10px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Save Address</button>
                            </form>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {addresses.length === 0 ? (
                                <p style={{ color: '#6b7280' }}>No saved addresses found.</p>
                            ) : addresses.map(addr => (
                                <div key={addr.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', position: 'relative' }}>
                                    <div style={{ fontWeight: '800' }}>{addr.city}, {addr.country}</div>
                                    <div style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: '6px' }}>{addr.address_line1}</div>
                                    {addr.address_line2 && <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>{addr.address_line2}</div>}
                                    <button onClick={() => handleDeleteAddress(addr.id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Settings */}
                {tab === 'settings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Change Password */}
                        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontWeight: '800', marginBottom: '24px', color: '#111827' }}>Change Password</h3>
                            <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
                                {[
                                    { key: 'old_password', label: 'Current Password' },
                                    { key: 'new_password', label: 'New Password' },
                                    { key: 'confirm', label: 'Confirm New Password' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '8px' }}>{label}</label>
                                        <input type="password" required value={(pwdForm as any)[key]} onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                                    </div>
                                ))}
                                <button type="submit" disabled={pwdLoading} style={{ padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                    {pwdLoading ? 'Saving...' : 'Update Password'}
                                </button>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <div style={{ backgroundColor: '#fef2f2', borderRadius: '20px', padding: '32px', border: '1px solid #fecaca' }}>
                            <h3 style={{ fontWeight: '800', marginBottom: '8px', color: '#991b1b' }}>Sign Out</h3>
                            <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginBottom: '20px' }}>You will be signed out of your account.</p>
                            <button onClick={() => { logout(); router.push('/'); }} style={{ padding: '12px 28px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Sign Out</button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default function AccountPage() {
    return <AppProvider><AccountContent /></AppProvider>;
}

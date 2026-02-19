"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '../../components/AppContext';
import { api } from '../../lib/api';

function RegisterContent() {
    const { login, toast } = useApp();
    const router = useRouter();
    const [form, setForm] = useState({ email: '', username: '', full_name: '', phone: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            toast('Passwords do not match', 'error');
            return;
        }
        if (form.password.length < 8) {
            toast('Password must be at least 8 characters', 'error');
            return;
        }
        setLoading(true);
        try {
            await api.register({
                email: form.email,
                username: form.username,
                full_name: form.full_name,
                phone: form.phone,
                password: form.password,
            });
            await login(form.email, form.password);
            toast('Account created! Welcome 🎉', 'success');
            router.push('/');
        } catch (err: any) {
            toast(err?.detail || 'Registration failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
        <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '8px' }}>{label}</label>
            <input
                type={type === 'password' ? (showPwd ? 'text' : 'password') : type}
                required={['email', 'username', 'full_name', 'password', 'confirm'].includes(key)}
                value={form[key]}
                placeholder={placeholder}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1rem' }}>AZ</div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>AlZain<span style={{ color: '#2563eb' }}>Shop</span></span>
                    </Link>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Create account</h1>
                    <p style={{ color: '#6b7280', marginBottom: '32px' }}>Start shopping in seconds. No credit card required.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {field('full_name', 'Full Name', 'text', 'John Doe')}
                            {field('username', 'Username', 'text', 'johndoe')}
                        </div>
                        {field('email', 'Email address', 'email', 'you@example.com')}
                        {field('phone', 'Phone (optional)', 'tel', '+973 ...')}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151' }}>Password</label>
                                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.9rem' }}>{showPwd ? 'Hide' : 'Show'}</button>
                                </div>
                                <input type={showPwd ? 'text' : 'password'} required minLength={8} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
                                <input type={showPwd ? 'text' : 'password'} required value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat password" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid ' + (form.confirm && form.password !== form.confirm ? '#dc2626' : '#e5e7eb'), fontSize: '1rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                                {form.confirm && form.password !== form.confirm && <p style={{ fontSize: '0.77rem', color: '#dc2626', marginTop: '4px' }}>Passwords don't match</p>}
                            </div>
                        </div>

                        {form.password && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {[form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password)].map((ok, i) => (
                                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '999px', backgroundColor: ok ? '#059669' : '#e5e7eb', transition: 'background 0.2s' }} />
                                ))}
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            style={{ padding: '16px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#6b7280' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: '#2563eb', fontWeight: '700' }}>Sign in →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return <AppProvider><RegisterContent /></AppProvider>;
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '../../components/AppContext';
import { api } from '../../lib/api';

function LoginContent() {
    const { login, toast } = useApp();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast('Welcome back!', 'success');
            router.push('/');
        } catch (err: any) {
            toast(err?.detail || 'Invalid email or password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '460px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1rem' }}>AZ</div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>AlZain<span style={{ color: '#2563eb' }}>Shop</span></span>
                    </Link>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Sign in</h1>
                    <p style={{ color: '#6b7280', marginBottom: '32px' }}>Welcome back! Please enter your details.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '8px' }}>Email address</label>
                            <input
                                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none', transition: 'border-color 0.15s' }}
                                onFocus={e => e.target.style.borderColor = '#2563eb'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151' }}>Password</label>
                                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '500' }}>Forgot password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{ width: '100%', padding: '14px 46px 14px 16px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none', transition: 'border-color 0.15s' }}
                                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem' }}>
                                    {showPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            style={{ padding: '16px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', transition: 'background-color 0.15s', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#6b7280' }}>
                        Don't have an account?{' '}
                        <Link href="/register" style={{ color: '#2563eb', fontWeight: '700' }}>Create one free →</Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: '#9ca3af' }}>
                    By signing in, you agree to our Terms and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return <AppProvider><LoginContent /></AppProvider>;
}

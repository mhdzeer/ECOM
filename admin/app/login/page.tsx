"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '../../components/AdminContext';

function LoginContent() {
    const { login, toast } = useAdmin();
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
            toast('Welcome to AlZain Admin!', 'success');
            router.push('/admin');
        } catch (err: any) {
            toast(err?.detail || 'Invalid credentials or insufficient permissions', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.2rem', margin: '0 auto 16px' }}>AZ</div>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800' }}>Admin Portal</h1>
                    <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '0.9rem' }}>Sign in to manage your store</p>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px 36px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '8px' }}>Admin Email</label>
                            <input
                                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@alzain.shop"
                                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '1rem', outline: 'none', backgroundColor: 'rgba(255,255,255,0.07)', color: 'white' }}
                                onFocus={e => e.target.style.border = '1px solid #2563eb'}
                                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.15)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '8px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{ width: '100%', padding: '14px 46px 14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '1rem', outline: 'none', backgroundColor: 'rgba(255,255,255,0.07)', color: 'white' }}
                                    onFocus={e => e.target.style.border = '1px solid #2563eb'}
                                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.15)'}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}>
                                    {showPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            style={{ padding: '16px', background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In to Admin'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(37,99,235,0.12)', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.2)' }}>
                        <p style={{ fontSize: '0.8rem', color: '#93c5fd', textAlign: 'center', fontWeight: '500' }}>
                            🔒 Only admin-role accounts can access this panel
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return <AdminProvider><LoginContent /></AdminProvider>;
}

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '../../components/AdminContext';
import Sidebar from '../../components/Sidebar';
import { adminApi } from '../../lib/api';

function ReviewsContent() {
    const { token } = useAdmin();
    const router = useRouter();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        fetchReviews();
    }, [token, filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getAdminReviews(token!, filter);
            setReviews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (id: number, status: string) => {
        try {
            await adminApi.moderateReview(token!, id, status);
            fetchReviews();
        } catch (err) { }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#111827' }}>Product Reviews</h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Moderate customer feedback and ratings.</p>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {['pending', 'approved', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: filter === s ? '#2563eb' : 'white',
                                color: filter === s ? 'white' : '#4b5563',
                                fontWeight: '700',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '80px', textAlign: 'center' }}><div className="spinner" /></div>
                    ) : reviews.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#6b7280' }}>No {filter} reviews found.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                                    {['Customer', 'Product', 'Rating', 'Comment', 'Date', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                        <td style={{ padding: '20px', fontSize: '0.875rem' }}>
                                            <div style={{ fontWeight: '700' }}>{r.user?.full_name || 'Guest'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{r.user?.email || 'No email'}</div>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem', color: '#374151' }}>{r.product?.name}</td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem' }}>
                                            <div style={{ color: '#f59e0b', fontWeight: '800' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem', color: '#4b5563', maxWidth: '300px' }}>
                                            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{r.title}</div>
                                            <div style={{ fontSize: '0.85rem' }}>{r.comment}</div>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '0.875rem', color: '#6b7280' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {r.status !== 'approved' && <button onClick={() => handleModerate(r.id, 'approved')} style={{ padding: '6px 12px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '6px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}>Approve</button>}
                                                {r.status !== 'rejected' && <button onClick={() => handleModerate(r.id, 'rejected')} style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '6px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}>Reject</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function AdminReviewsPage() {
    return <AdminProvider><ReviewsContent /></AdminProvider>;
}

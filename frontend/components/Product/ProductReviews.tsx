"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../AppContext';

interface Review {
    id: number;
    user_id: number;
    user_name: string;
    rating: number;
    title?: string;
    body?: string;
    created_at: string;
    helpful_count: number;
}

interface Summary {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<string, number>;
}

export default function ProductReviews({ productId }: { productId: number }) {
    const { user, token, toast } = useApp();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [productId]);

    const fetchData = async () => {
        try {
            const [revList, revSummary] = await Promise.all([
                api.getProductReviews(productId),
                api.getProductReviewSummary(productId)
            ]);
            setReviews(revList);
            setSummary(revSummary);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast("Please login to submit a review", "error");
            return;
        }

        setSubmitting(true);
        try {
            await api.createReview(token, {
                product_id: productId,
                rating,
                title,
                body
            });
            toast("Review submitted! It will appear after moderation.", "success");
            setShowForm(false);
            setTitle('');
            setBody('');
            setRating(5);
        } catch (err: any) {
            toast(err.detail || "Failed to submit review", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div style={{ marginTop: '60px', padding: '40px 0', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Customer Reviews</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                >
                    {showForm ? 'Cancel' : 'Write a Review'}
                </button>
            </div>

            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px', backgroundColor: '#f9fafb', padding: '30px', borderRadius: '20px', marginBottom: '40px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', fontWeight: '900', color: '#111827' }}>{summary.average_rating.toFixed(1)}</div>
                        <div style={{ color: '#fbbf24', fontSize: '1.2rem', marginBottom: '8px' }}>
                            {'★'.repeat(Math.round(summary.average_rating))}{'☆'.repeat(5 - Math.round(summary.average_rating))}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Based on {summary.total_reviews} reviews</div>
                    </div>
                    <div>
                        {[5, 4, 3, 2, 1].map(stars => {
                            const count = summary.rating_distribution[stars] || 0;
                            const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
                            return (
                                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span style={{ width: '20px', fontSize: '0.875rem', fontWeight: '600' }}>{stars}</span>
                                    <span style={{ color: '#fbbf24' }}>★</span>
                                    <div style={{ flex: 1, height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#fbbf24' }} />
                                    </div>
                                    <span style={{ width: '40px', fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '2px solid #2563eb', marginBottom: '40px' }}>
                    <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Share your experience</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Rating</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} type="button" onClick={() => setRating(s)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: s <= rating ? '#fbbf24' : '#d1d5db' }}>
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Title (optional)</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Example: Great quality!"
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Review</label>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="What did you like or dislike?"
                            required
                            rows={4}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontFamily: 'inherit' }}
                        />
                    </div>
                    <button
                        disabled={submitting}
                        style={{ padding: '12px 30px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    {!user && <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#dc2626' }}>Note: You must be logged in to submit a review.</p>}
                </form>
            )}

            <div style={{ display: 'grid', gap: '24px' }}>
                {reviews.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', py: '20px' }}>No reviews yet. Be the first to review this product!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} style={{ padding: '24px', border: '1px solid #f3f4f6', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#6b7280' }}>
                                        {review.user_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{review.user_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(review.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ color: '#fbbf24' }}>
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                            </div>
                            {review.title && <h4 style={{ margin: '0 0 8px', fontWeight: '700' }}>{review.title}</h4>}
                            <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>{review.body}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

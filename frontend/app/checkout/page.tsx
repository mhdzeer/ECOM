"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { AppProvider, useApp } from '../../components/AppContext';
import { api } from '../../lib/api';

function CheckoutContent() {
    const router = useRouter();
    const { cart, token, user, cartTotal, clearCart, toast } = useApp();
    const [step, setStep] = useState(1); // 1: shipping, 2: review, 3: done
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [form, setForm] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        address_line1: '',
        address_line2: '',
        city: '',
        country: 'Bahrain',
        notes: '',
    });

    useEffect(() => {
        if (cart.length === 0 && step !== 3) router.push('/cart');
    }, [cart]);

    useEffect(() => {
        if (user) setForm(f => ({ ...f, full_name: user.full_name || '', phone: user.phone || '' }));
    }, [user]);

    const tax = cartTotal * 0.1;
    const shipping = cartTotal >= 50 ? 0 : 5.99;
    const grandTotal = cartTotal + tax + shipping;

    const shippingAddress = `${form.full_name}, ${form.address_line1}${form.address_line2 ? ', ' + form.address_line2 : ''}, ${form.city}, ${form.country}`;

    const placeOrder = async () => {
        if (!token) {
            toast('Please sign in to place your order', 'error');
            router.push('/login');
            return;
        }
        setLoading(true);
        try {
            const order = await api.createOrder(token, {
                items: cart.map(i => ({
                    product_id: i.product.id,
                    product_name: i.product.name,
                    quantity: i.quantity,
                    price: i.product.price,
                })),
                shipping_address: shippingAddress,
                phone: form.phone,
                notes: form.notes,
            });
            clearCart();
            setOrderId(order.order_number);
            setStep(3);
        } catch (err: any) {
            toast(err?.detail || 'Failed to place order. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Step 3 — success
    if (step === 3) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
                <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.5rem' }}>✅</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', marginBottom: '12px' }}>Order Placed!</h1>
                    <p style={{ color: '#4b5563', fontSize: '1.05rem', marginBottom: '10px' }}>Thank you for your purchase. Your order is being processed.</p>
                    <div style={{ backgroundColor: '#f3f4f6', padding: '16px 24px', borderRadius: '12px', marginBottom: '32px', display: 'inline-block' }}>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Order Number</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#111827' }}>{orderId}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/orders" style={{ padding: '14px 28px', backgroundColor: '#2563eb', color: 'white', borderRadius: '14px', textDecoration: 'none', fontWeight: '700' }}>Track My Order</Link>
                        <Link href="/" style={{ padding: '14px 28px', backgroundColor: 'white', color: '#374151', borderRadius: '14px', textDecoration: 'none', fontWeight: '700', border: '1px solid #e5e7eb' }}>Continue Shopping</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Navigation />

            <div style={{ maxWidth: '1060px', margin: '0 auto', width: '100%', padding: '40px 20px', flex: 1 }}>
                {/* Steps indicator */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '40px', maxWidth: '400px' }}>
                    {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Review' }].map(s => (
                        <React.Fragment key={s.n}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step >= s.n ? '#2563eb' : '#e5e7eb', color: step >= s.n ? 'white' : '#9ca3af', fontWeight: '700', fontSize: '0.875rem', flexShrink: 0 }}>{s.n}</div>
                                <span style={{ fontSize: '0.875rem', fontWeight: step === s.n ? '700' : '400', color: step === s.n ? '#111827' : '#6b7280' }}>{s.label}</span>
                            </div>
                            {s.n < 2 && <div style={{ width: '40px', height: '2px', backgroundColor: step > s.n ? '#2563eb' : '#e5e7eb', flexShrink: 0 }} />}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
                    {/* Left: Steps */}
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', border: '1px solid #e5e7eb' }}>
                        {!token && (
                            <div style={{ marginBottom: '28px', padding: '16px 20px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: '#1d4ed8', fontWeight: '500' }}>Have an account? Sign in to autofill your details.</span>
                                <Link href="/login" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: '700' }}>Sign in →</Link>
                            </div>
                        )}

                        {step === 1 && (
                            <>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Shipping Information</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {[
                                        { key: 'full_name', label: 'Full Name', col: 'span 2' },
                                        { key: 'phone', label: 'Phone Number', col: '1' },
                                        { key: 'country', label: 'Country', col: '1' },
                                        { key: 'address_line1', label: 'Address Line 1', col: 'span 2' },
                                        { key: 'address_line2', label: 'Address Line 2 (optional)', col: 'span 2' },
                                        { key: 'city', label: 'City', col: '1' },
                                        { key: 'notes', label: 'Order Notes (optional)', col: 'span 2' },
                                    ].map(({ key, label, col }) => (
                                        <div key={key} style={{ gridColumn: col }}>
                                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '8px' }}>{label}</label>
                                            {key === 'notes' ? (
                                                <textarea value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', resize: 'vertical', minHeight: '80px', outline: 'none' }} />
                                            ) : (
                                                <input type="text" required={!['address_line2', 'notes'].includes(key)} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        if (!form.full_name || !form.phone || !form.address_line1 || !form.city) { toast('Please fill all required fields', 'error'); return; }
                                        setStep(2);
                                    }}
                                    style={{ marginTop: '30px', width: '100%', padding: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}
                                >
                                    Continue to Review →
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Review Your Order</h2>

                                {/* Shipping summary */}
                                <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#374151' }}>Shipping to</span>
                                        <button onClick={() => setStep(1)} style={{ fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5' }}>{shippingAddress}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: '4px' }}>📞 {form.phone}</p>
                                </div>

                                {/* Items review */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontWeight: '700', fontSize: '0.875rem', color: '#374151', marginBottom: '12px' }}>Items ({cart.reduce((a, b) => a + b.quantity, 0)})</h3>
                                    {cart.map(i => (
                                        <div key={i.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#4b5563' }}>{i.product.name} <span style={{ color: '#9ca3af' }}>× {i.quantity}</span></span>
                                            <span style={{ fontWeight: '700' }}>${(i.product.price * i.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment note */}
                                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>💳</span>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#92400e' }}>Cash on Delivery</div>
                                        <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>Pay when your order arrives. No card required.</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
                                    <button onClick={placeOrder} disabled={loading} style={{ flex: 2, padding: '16px', backgroundColor: loading ? '#60a5fa' : '#059669', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: loading ? 'wait' : 'pointer' }}>
                                        {loading ? 'Placing Order...' : `Place Order — $${grandTotal.toFixed(2)}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Summary */}
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #e5e7eb', position: 'sticky', top: '80px' }}>
                        <h3 style={{ fontWeight: '800', marginBottom: '20px', color: '#111827' }}>Order Total</h3>
                        {cart.map(i => (
                            <div key={i.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem', gap: '10px' }}>
                                <span style={{ color: '#4b5563', flex: 1 }}>{i.product.name} ×{i.quantity}</span>
                                <span style={{ fontWeight: '600', flexShrink: 0 }}>${(i.product.price * i.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#4b5563' }}>
                                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#4b5563' }}>
                                <span>Shipping</span>
                                <span style={{ color: shipping === 0 ? '#059669' : 'inherit' }}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#4b5563' }}>
                                <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                            </div>
                            <div style={{ borderTop: '2px solid #111827', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '900' }}>
                                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function CheckoutPage() {
    return <AppProvider><CheckoutContent /></AppProvider>;
}

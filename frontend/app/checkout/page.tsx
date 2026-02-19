"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface CartItem {
    product: {
        id: number;
        name: string;
        price: number;
    };
    quantity: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [formData, setFormData] = useState({
        shipping_address: '',
        phone: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';
    const orderApi = `http://${domain}:39101/api/orders`;

    useEffect(() => {
        const savedCart = localStorage.getItem('ecom_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        } else {
            router.push('/');
        }
    }, []);

    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const tax = total * 0.1;
    const shipping = 10.0;
    const grandTotal = total + tax + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Mock Authorization for now - in production this comes from context/cookies
            const mockToken = "Bearer mock-token";

            const payload = {
                items: cart.map(item => ({
                    product_id: item.product.id,
                    product_name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                shipping_address: formData.shipping_address,
                phone: formData.phone,
                notes: formData.notes
            };

            const response = await axios.post(orderApi, payload, {
                headers: {
                    'Authorization': mockToken
                }
            });

            // Clear cart
            localStorage.removeItem('ecom_cart');
            alert(`Order Placed Successfully! Order #: ${response.data.order_number}`);
            router.push('/orders');
        } catch (error: any) {
            console.error(error);
            alert('Failed to place order. ' + (error.response?.data?.detail || ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '60px 5%' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', marginBottom: '40px' }}>Secure Checkout</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                    {/* Form */}
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Shipping Information</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Full Shipping Address</label>
                                <textarea
                                    required
                                    value={formData.shipping_address}
                                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                    placeholder="Street name, City, State, ZIP"
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', minHeight: '100px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+973 ..."
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                                />
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Order Notes (Optional)</label>
                                <input
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Delivery instructions..."
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '16px', marginBottom: '30px' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>
                                    💡 Payment is currently <strong>Cash on Delivery</strong> or Mock Processing.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#111827',
                                    color: 'white',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: isSubmitting ? 'default' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                {isSubmitting ? 'Processing Order...' : `Pay $${grandTotal.toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* Summary */}
                    <div>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Order Summary</h3>
                            {cart.map(item => (
                                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#4b5563' }}>{item.product.name} x{item.quantity}</span>
                                    <span style={{ fontWeight: '600' }}>${(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>Tax (10%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>Shipping</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #111827', fontWeight: '900', fontSize: '1.25rem' }}>
                                    <span>Total</span>
                                    <span>${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

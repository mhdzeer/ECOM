"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
    category_id?: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        sku: '',
        category_id: 1,
        images: []
    });

    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';
    const apiUrl = `http://${domain}:39101/api/products`;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${apiUrl}/`);
            setProducts(response.data.products || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // In a real app, we'd need admin token. For now, we assume the backend doesn't enforce it strictly or we'll add auth later.
            await axios.post(`${apiUrl}/`, {
                ...newProduct,
                images: [] // Initially empty
            });
            setShowModal(false);
            fetchProducts();
            setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, sku: '', category_id: 1, images: [] });
        } catch (error) {
            alert('Error creating product. Make sure you are logged in or have access.');
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', margin: 0 }}>📦 Product Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    + Add New Product
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: '600' }}>Product</th>
                            <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: '600' }}>SKU</th>
                            <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: '600' }}>Price</th>
                            <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: '600' }}>Stock</th>
                            <th style={{ padding: '16px 24px', color: '#6b7280', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading products...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No products found. Start by adding one!</td></tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{p.description.substring(0, 50)}...</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#4b5563' }}>{p.sku}</td>
                                    <td style={{ padding: '16px 24px', color: '#111827', fontWeight: '600' }}>${p.price}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '99px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            backgroundColor: p.stock_quantity > 10 ? '#f0fdf4' : '#fef2f2',
                                            color: p.stock_quantity > 10 ? '#166534' : '#991b1b'
                                        }}>
                                            {p.stock_quantity} in stock
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                        <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600', marginLeft: '12px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Basic Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Add New Product</h2>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                                <textarea
                                    required
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Price ($)</label>
                                    <input
                                        required
                                        type="number"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Stock</label>
                                    <input
                                        required
                                        type="number"
                                        value={newProduct.stock_quantity}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>SKU (Unique Code)</label>
                                <input
                                    required
                                    type="text"
                                    value={newProduct.sku}
                                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

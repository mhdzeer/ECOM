"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '../../components/AdminContext';
import Sidebar from '../../components/Sidebar';
import { adminApi } from '../../lib/api';

function VariantsContent() {
    const { token, toast } = useAdmin();
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [variants, setVariants] = useState<any[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form logic
    const [showAttrForm, setShowAttrForm] = useState(false);
    const [attrName, setAttrName] = useState('');

    const [showOptionForm, setShowOptionForm] = useState<number | null>(null);
    const [optionValue, setOptionValue] = useState('');

    const [showVariantForm, setShowVariantForm] = useState(false);
    const [vForm, setVForm] = useState({
        price: 0, stock_quantity: 0, sku: '', combinations: [] as { option_id: number }[]
    });

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        fetchData();
    }, [token, id]);

    const fetchData = async () => {
        try {
            const pid = parseInt(id);
            const p = await adminApi.getProducts(token!); // Or a single product api if exists
            const active = (p.products || []).find((x: any) => x.id === pid);
            setProduct(active);
            setVariants(active?.variants || []);
            const allAttrs = await fetch(`${adminApi.getBaseUrl()}/products/attributes`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());
            setAttributes(allAttrs);
        } catch (err) { }
        setLoading(false);
    };

    const handleAddAttribute = async () => {
        if (!attrName) return;
        await adminApi.adminAddAttribute(token!, { name: attrName });
        setAttrName('');
        setShowAttrForm(false);
        fetchData();
    };

    const handleAddOption = async (attrId: number) => {
        if (!optionValue) return;
        await adminApi.adminAddAttributeOption(token!, attrId, { value: optionValue });
        setOptionValue('');
        setShowOptionForm(null);
        fetchData();
    };

    const handleAddVariant = async () => {
        await adminApi.adminAddProductVariant(token!, product.id, {
            ...vForm,
            attribute_option_ids: vForm.combinations.map(c => c.option_id)
        });
        setShowVariantForm(false);
        fetchData();
    };

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Variants: {product.name}</h1>
                    <button onClick={() => router.back()} style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Back to Products</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Attributes Management */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Attributes (Global)</h2>
                            <button onClick={() => setShowAttrForm(!showAttrForm)} style={{ padding: '6px 12px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Add Attribute</button>
                        </div>

                        {showAttrForm && (
                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                                <input placeholder="e.g. Size" value={attrName} onChange={e => setAttrName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', marginRight: '10px' }} />
                                <button onClick={handleAddAttribute} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px' }}>Save</button>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {attributes.map(attr => (
                                <div key={attr.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: '700' }}>{attr.name}</div>
                                        <button onClick={() => setShowOptionForm(attr.id)} style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Option</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {attr.options?.map((opt: any) => (
                                            <span key={opt.id} style={{ padding: '4px 10px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600' }}>{opt.value}</span>
                                        ))}
                                    </div>
                                    {showOptionForm === attr.id && (
                                        <div style={{ marginTop: '10px' }}>
                                            <input placeholder="e.g. Small" value={optionValue} onChange={e => setOptionValue(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ddd', marginRight: '10px', fontSize: '0.8rem' }} />
                                            <button onClick={() => handleAddOption(attr.id)} style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem' }}>Save</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Variants List */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Active Variants</h2>
                            <button onClick={() => setShowVariantForm(!showVariantForm)} style={{ padding: '6px 12px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Create Variant</button>
                        </div>

                        {showVariantForm && (
                            <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>PRICE</label>
                                        <input type="number" step="0.01" value={vForm.price} onChange={e => setVForm({ ...vForm, price: parseFloat(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>STOCK</label>
                                        <input type="number" value={vForm.stock_quantity} onChange={e => setVForm({ ...vForm, stock_quantity: parseInt(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>
                                </div>

                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>ATTRIBUTES</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                                    {attributes.map(attr => (
                                        <div key={attr.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.85rem', width: '60px' }}>{attr.name}</span>
                                            <select
                                                onChange={(e) => {
                                                    const optId = parseInt(e.target.value);
                                                    if (!optId) return;
                                                    const other = vForm.combinations.filter(c => !attr.options.find((o: any) => o.id === c.option_id));
                                                    setVForm({ ...vForm, combinations: [...other, { option_id: optId }] });
                                                }}
                                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ddd' }}
                                            >
                                                <option value="">Select...</option>
                                                {attr.options?.map((o: any) => <option key={o.id} value={o.id}>{o.value}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={handleAddVariant} style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Create Variant</button>
                            </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee', fontSize: '0.7rem', color: '#6b7280' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>VARIANT</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>PRICE</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>STOCK</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variants.map(v => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                        <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                                            {v.attributes.map((a: any) => (
                                                <span key={a.id} style={{ marginRight: '6px', padding: '2px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>{a.option.value}</span>
                                            ))}
                                        </td>
                                        <td style={{ padding: '10px', fontSize: '0.85rem', fontWeight: '700' }}>${v.price.toFixed(2)}</td>
                                        <td style={{ padding: '10px', fontSize: '0.85rem' }}>{v.stock_quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AdminVariantsPage() {
    return <AdminProvider><VariantsContent /></AdminProvider>;
}

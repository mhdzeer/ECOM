"use client";

import React from 'react';
import Link from 'next/link';

interface NavProps {
    cartCount: number;
    onCartClick: () => void;
}

const Navigation = ({ cartCount, onCartClick }: NavProps) => {
    return (
        <nav style={{
            padding: '20px 5%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            zindex: 1000,
            borderBottom: '1px solid #eee'
        }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px' }}>
                    ALZAIN<span style={{ color: '#3b82f6' }}>SHOP</span>
                </div>
            </Link>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <Link href="/" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500' }}>Shop</Link>
                <Link href="/orders" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500' }}>My Orders</Link>

                <button
                    onClick={onCartClick}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    🛒
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '50%',
                            fontWeight: 'bold'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </nav>
    );
};

export default Navigation;

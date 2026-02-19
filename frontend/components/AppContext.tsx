"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
    id: number;
    email: string;
    username: string;
    full_name?: string;
    phone?: string;
    role: string;
}

interface CartItem {
    product: {
        id: number;
        name: string;
        price: number;
        images: { image_url: string }[];
    };
    quantity: number;
}

interface AppContextType {
    user: User | null;
    token: string | null;
    cart: CartItem[];
    wishlist: number[];
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateCartQty: (productId: number, quantity: number) => void;
    clearCart: () => void;
    toggleWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    cartCount: number;
    cartTotal: number;
    toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<number[]>([]);

    useEffect(() => {
        // Load from localStorage
        try {
            const savedToken = localStorage.getItem('auth_token');
            const savedCart = localStorage.getItem('ecom_cart');
            const savedWishlist = localStorage.getItem('ecom_wishlist');

            if (savedCart) setCart(JSON.parse(savedCart));
            if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

            if (savedToken) {
                setToken(savedToken);
                api.getMe(savedToken).then(setUser).catch(() => {
                    localStorage.removeItem('auth_token');
                });
            }
        } catch (e) { /* ignore */ }
    }, []);

    useEffect(() => {
        localStorage.setItem('ecom_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('ecom_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const login = async (email: string, password: string) => {
        const data = await api.login(email, password);
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('auth_token', data.access_token);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
    };

    const addToCart = (product: any, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                );
            }
            return [...prev, { product: { id: product.id, name: product.name, price: product.price, images: product.images || [] }, quantity }];
        });
        toast(`"${product.name}" added to cart!`, 'success');
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
    };

    const updateCartQty = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    };

    const clearCart = () => setCart([]);

    const toggleWishlist = (productId: number) => {
        setWishlist(prev => {
            if (prev.includes(productId)) {
                toast('Removed from wishlist', 'info');
                return prev.filter(id => id !== productId);
            }
            toast('Added to wishlist ❤️', 'success');
            return [...prev, productId];
        });
    };

    const isInWishlist = (productId: number) => wishlist.includes(productId);

    const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const div = document.createElement('div');
        div.textContent = message;
        div.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 0.95rem;
      color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb'};
      animation: slideIn 0.3s ease; font-family: inherit;
    `;
        document.body.appendChild(div);
        setTimeout(() => { div.style.opacity = '0'; div.style.transition = '0.5s'; }, 2500);
        setTimeout(() => div.remove(), 3000);
    };

    const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
    const cartTotal = cart.reduce((a, b) => a + b.product.price * b.quantity, 0);

    return (
        <AppContext.Provider value={{
            user, token, cart, wishlist,
            login, logout,
            addToCart, removeFromCart, updateCartQty, clearCart,
            toggleWishlist, isInWishlist,
            cartCount, cartTotal, toast
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be inside AppProvider');
    return ctx;
};

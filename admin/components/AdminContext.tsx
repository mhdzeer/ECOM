"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi } from '../lib/api';

interface AdminUser {
    id: number;
    email: string;
    full_name?: string;
    role: string;
}

interface AdminContextType {
    user: AdminUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token');
        const savedUser = localStorage.getItem('admin_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const data = await adminApi.login(email, password);
        if (data.user.role !== 'admin') throw { detail: 'You are not authorized as admin.' };
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    };

    const toast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        const div = document.createElement('div');
        div.textContent = msg;
        div.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 0.9rem;
      color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); font-family: 'Inter', sans-serif;
      background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb'};
      transition: opacity 0.5s;
    `;
        document.body.appendChild(div);
        setTimeout(() => { div.style.opacity = '0'; }, 2500);
        setTimeout(() => div.remove(), 3000);
    };

    return (
        <AdminContext.Provider value={{ user, token, login, logout, isLoading, toast }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
    return ctx;
};

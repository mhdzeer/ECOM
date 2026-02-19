// API utility - all requests go through Nginx on port 39101
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:39101/api`;
    }
    return 'http://nginx:3001/api';
};

export const api = {
    // Auth
    async register(data: { email: string; username: string; password: string; full_name: string; phone?: string }) {
        const res = await fetch(`${getBaseUrl()}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async login(email: string, password: string) {
        const res = await fetch(`${getBaseUrl()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getMe(token: string) {
        const res = await fetch(`${getBaseUrl()}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    // Products
    async getProducts(params?: {
        page?: number;
        page_size?: number;
        category_id?: number;
        search?: string;
        min_price?: number;
        max_price?: number;
        is_featured?: boolean;
    }) {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.page_size) query.set('page_size', String(params.page_size));
        if (params?.category_id) query.set('category_id', String(params.category_id));
        if (params?.search) query.set('search', params.search);
        if (params?.min_price !== undefined) query.set('min_price', String(params.min_price));
        if (params?.max_price !== undefined) query.set('max_price', String(params.max_price));
        if (params?.is_featured !== undefined) query.set('is_featured', String(params.is_featured));

        const res = await fetch(`${getBaseUrl()}/products/?${query}`);
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getProduct(id: number) {
        const res = await fetch(`${getBaseUrl()}/products/${id}`);
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getCategories() {
        const res = await fetch(`${getBaseUrl()}/products/categories`);
        if (!res.ok) throw await res.json();
        return res.json();
    },

    // Orders
    async createOrder(token: string, data: {
        items: { product_id: number; product_name: string; quantity: number; price: number }[];
        shipping_address: string;
        phone: string;
        notes?: string;
    }) {
        const res = await fetch(`${getBaseUrl()}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getOrders(token: string) {
        const res = await fetch(`${getBaseUrl()}/orders/`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getOrder(token: string, id: number) {
        const res = await fetch(`${getBaseUrl()}/orders/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    // Admin
    async adminCreateProduct(token: string, data: object) {
        const res = await fetch(`${getBaseUrl()}/products/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async adminDeleteProduct(token: string, id: number) {
        const res = await fetch(`${getBaseUrl()}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return true;
    },

    async adminUpdateProduct(token: string, id: number, data: object) {
        const res = await fetch(`${getBaseUrl()}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async adminCreateCategory(token: string, data: object) {
        const res = await fetch(`${getBaseUrl()}/products/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async adminGetAllOrders(token: string) {
        const res = await fetch(`${getBaseUrl()}/orders/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async adminUpdateOrderStatus(token: string, orderId: number, status: string) {
        const res = await fetch(`${getBaseUrl()}/orders/${orderId}/status?status=${status}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },
};

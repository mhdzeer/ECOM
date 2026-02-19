// Admin API utility - reads from the admin panel context
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return `http://${window.location.hostname}:39101/api`;
    }
    return 'http://nginx:3001/api';
};

export const adminApi = {
    async login(email: string, password: string) {
        const res = await fetch(`${getBaseUrl()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getProducts(token: string) {
        const res = await fetch(`${getBaseUrl()}/products/?page_size=100`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async createProduct(token: string, data: object) {
        const res = await fetch(`${getBaseUrl()}/products/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async updateProduct(token: string, id: number, data: object) {
        const res = await fetch(`${getBaseUrl()}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async deleteProduct(token: string, id: number) {
        const res = await fetch(`${getBaseUrl()}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return true;
    },

    async updateStock(token: string, id: number, quantity: number) {
        const res = await fetch(`${getBaseUrl()}/products/${id}/stock?quantity=${quantity}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getCategories(token: string) {
        const res = await fetch(`${getBaseUrl()}/products/categories`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async createCategory(token: string, data: object) {
        const res = await fetch(`${getBaseUrl()}/products/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getAllOrders(token: string) {
        const res = await fetch(`${getBaseUrl()}/orders/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async getOrderStats(token: string) {
        const res = await fetch(`${getBaseUrl()}/orders/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return null;
        return res.json();
    },

    async updateOrderStatus(token: string, orderId: number, status: string) {
        const res = await fetch(`${getBaseUrl()}/orders/${orderId}/status?status=${status}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },
};

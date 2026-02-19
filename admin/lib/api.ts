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

    // Coupons
    async getCoupons(token: string) {
        const res = await fetch(`${getBaseUrl()}/coupons/`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async createCoupon(token: string, data: object) {
        const res = await fetch(`${getBaseUrl()}/coupons/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async deleteCoupon(token: string, code: string) {
        const res = await fetch(`${getBaseUrl()}/coupons/${code}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return true;
    },

    // Reviews
    async getAdminReviews(token: string, status?: string) {
        const query = status ? `?status=${status}` : '';
        const res = await fetch(`${getBaseUrl()}/reviews/admin/all${query}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    async moderateReview(token: string, id: number, status: string) {
        const res = await fetch(`${getBaseUrl()}/reviews/${id}/moderate?status=${status}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    // Variants & Attributes
    async adminAddAttribute(token: string, data: { name: string }) {
        const res = await fetch(`${getBaseUrl()}/products/attributes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async adminAddAttributeOption(token: string, attrId: number, data: { value: string }) {
        const res = await fetch(`${getBaseUrl()}/products/attributes/${attrId}/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async adminAddProductVariant(token: string, productId: number, data: any) {
        const res = await fetch(`${getBaseUrl()}/products/${productId}/variants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        return res.json();
    },
};

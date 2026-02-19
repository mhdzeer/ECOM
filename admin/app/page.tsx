export default function AdminHome() {
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'alzainportal.shopinbh.com';
    const baseUrl = `http://${domain}:39080/api`;

    const managementLinks = [
        { name: '📦 Product Management', path: '/products/docs', color: '#4f46e5' },
        { name: '🔐 User & Security', path: '/auth/docs', color: '#0891b2' },
        { name: '🛒 Order Tracking', path: '/orders/docs', color: '#059669' },
        { name: '🚚 Delivery Management', path: '/delivery/docs', color: '#d97706' },
        { name: '💳 Payment Systems', path: '/payment/docs', color: '#dc2626' },
    ];

    return (
        <div style={{
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#f9fafb',
            minHeight: '100vh',
            color: '#111827'
        }}>
            <header style={{ marginBottom: '40px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>⚙️ Admin Control Center</h1>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>Manage your e-commerce platform services</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {managementLinks.map((link) => (
                    <a
                        key={link.path}
                        href={`${baseUrl}${link.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'none',
                            padding: '24px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: '1px solid #f3f4f6',
                            display: 'block'
                        }}
                    >
                        <h2 style={{ fontSize: '1.25rem', color: link.color, marginBottom: '12px' }}>{link.name}</h2>
                        <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                            Access direct API controls to manage these services.
                        </p>
                        <div style={{ marginTop: '16px', fontWeight: '600', color: link.color, fontSize: '0.875rem' }}>
                            Open Documentation →
                        </div>
                    </a>
                ))}
            </div>

            <footer style={{ marginTop: '60px', color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' }}>
                <p>Connected to Gateway: {baseUrl}</p>
            </footer>
        </div>
    )
}

import Sidebar from '../components/Sidebar';

export const metadata = {
    title: 'AlZain Admin - E-commerce',
    description: 'Admin portal for e-commerce platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex' }}>
                    <Sidebar />
                    <main style={{
                        marginLeft: '260px',
                        width: 'calc(100% - 260px)',
                        minHeight: '100vh',
                        padding: '30px'
                    }}>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AlZain Admin — Control Panel',
    description: 'AlZain E-commerce Administration Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>{children}</body>
        </html>
    );
}

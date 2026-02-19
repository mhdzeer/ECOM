import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AlZain Shop — Premium E-commerce',
    description: 'Discover our curated collection of premium products. Shop the latest trends with fast delivery and easy returns.',
    keywords: 'ecommerce, shop, premium, products, online store',
    manifest: '/manifest.json',
    openGraph: {
        title: 'AlZain Shop',
        description: 'Premium curated products delivered to your doorstep.',
        type: 'website',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body>{children}</body>
        </html>
    );
}

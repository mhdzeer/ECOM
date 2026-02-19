export const metadata = {
    title: 'AlZain Shop - Premium E-commerce',
    description: 'Discover premium products curated for you.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0 }}>{children}</body>
        </html>
    )
}

export const metadata = {
    title: 'Admin Portal - E-commerce',
    description: 'Admin portal for e-commerce platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

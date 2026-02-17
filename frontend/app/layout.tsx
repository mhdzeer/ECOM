export const metadata = {
    title: 'E-commerce Platform',
    description: 'Modern e-commerce platform with microservices',
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

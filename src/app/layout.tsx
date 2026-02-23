import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
    title: 'ProyectoHouse MVP',
    description: 'Gestión moderna de inmuebles y alquileres en Uruguay',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
            <body className="antialiased min-h-screen">
                {children}
            </body>
        </html>
    )
}

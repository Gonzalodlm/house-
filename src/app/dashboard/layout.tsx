'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Building2, Users, FileText, LogOut, Menu, BanknoteIcon, ReceiptIcon } from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Panel Principal', exact: true },
    { href: '/dashboard/properties', icon: Building2, label: 'Propiedades' },
    { href: '/dashboard/tenants', icon: Users, label: 'Inquilinos' },
    { href: '/dashboard/leases', icon: FileText, label: 'Contratos' },
    { href: '/dashboard/payments', icon: BanknoteIcon, label: 'Cobros' },
    { href: '/dashboard/expenses', icon: ReceiptIcon, label: 'Gastos' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-blue-600">
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-100" />ProyectoHouse
                        </h1>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                    onClick={() => setSidebarOpen(false)}>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 pb-8">
                        <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                            <LogOut className="w-5 h-5" />Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-slate-200 lg:hidden shadow-sm">
                    <h1 className="font-bold text-lg text-slate-800">ProyectoHouse</h1>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 relative">
                    {children}
                </main>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { BanknotesIcon, BuildingOffice2Icon, UsersIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Stats {
    propertiesCount: number
    tenantsCount: number
    activeLeasesCount: number
    totalRentUYU: number
    expiring30: number
    expiring60: number
    expiring90: number
}

interface Payment {
    id: string
    paidAt: string
    amountUYU: number
    method: string
    lease: { tenant: { fullName: string }; unit: { unitLabel: string; property: { name: string } } }
}

interface Expense {
    id: string
    date: string
    amountUYU: number
    category: string
    property: { name: string }
}

function fmt(n: number) { return n.toLocaleString('es-UY') }

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [payments, setPayments] = useState<Payment[]>([])
    const [expenses, setExpenses] = useState<Expense[]>([])

    useEffect(() => {
        fetch('/api/dashboard/stats').then(r => r.json()).then(setStats).catch(console.error)
        fetch('/api/payments').then(r => r.json()).then(p => setPayments(Array.isArray(p) ? p.slice(0, 5) : [])).catch(console.error)
        fetch('/api/expenses').then(r => r.json()).then(e => setExpenses(Array.isArray(e) ? e.slice(0, 5) : [])).catch(console.error)
    }, [])

    const metrics = stats ? [
        { title: 'Alquiler Mensual Total', value: `$ ${fmt(stats.totalRentUYU)}`, subtitle: 'UYU en contratos activos', icon: BanknotesIcon, color: 'bg-emerald-100 text-emerald-600' },
        { title: 'Contratos Activos', value: String(stats.activeLeasesCount), subtitle: 'alquileres vigentes', icon: DocumentTextIcon, color: 'bg-blue-100 text-blue-600' },
        { title: 'Propiedades', value: String(stats.propertiesCount), subtitle: 'inmuebles registrados', icon: BuildingOffice2Icon, color: 'bg-indigo-100 text-indigo-600' },
        { title: 'Inquilinos', value: String(stats.tenantsCount), subtitle: 'en la base de datos', icon: UsersIcon, color: 'bg-amber-100 text-amber-600' },
    ] : []

    const totalCobrosEstesMes = payments
        .filter(p => new Date(p.paidAt).getMonth() === new Date().getMonth())
        .reduce((s, p) => s + p.amountUYU, 0)

    const totalGastosEsteMes = expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((s, e) => s + e.amountUYU, 0)

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Principal</h1>
                <p className="text-slate-500 mt-1">Resumen general de tu cartera de propiedades.</p>
            </header>

            {!stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-40 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((m) => (
                        <div key={m.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover-lift flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-slate-600 font-medium text-sm w-3/4">{m.title}</h2>
                                <div className={`p-2 rounded-xl ${m.color}`}><m.icon className="w-6 h-6" /></div>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                                <p className="text-xs text-slate-400 mt-1 font-medium">{m.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Vencimientos */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                            Próximos Vencimientos
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Contratos</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-red-50/50 border border-red-100">
                                <span className="text-sm font-semibold text-red-700">30 Días</span>
                                <span className="bg-white text-red-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">{stats.expiring30}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                                <span className="text-sm font-semibold text-orange-700">60 Días</span>
                                <span className="bg-white text-orange-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">{stats.expiring60}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                                <span className="text-sm font-semibold text-amber-700">90 Días</span>
                                <span className="bg-white text-amber-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">{stats.expiring90}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rentabilidad este mes */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Resumen del Mes</h3>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Cobros</p>
                                <p className="text-xl font-bold text-emerald-700">$ {fmt(totalCobrosEstesMes)}</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 text-center">
                                <p className="text-xs text-red-500 font-semibold uppercase mb-1">Gastos</p>
                                <p className="text-xl font-bold text-red-600">$ {fmt(totalGastosEsteMes)}</p>
                            </div>
                            <div className={`rounded-xl p-4 text-center ${totalCobrosEstesMes - totalGastosEsteMes >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                <p className="text-xs font-semibold uppercase mb-1 text-blue-600">Neto</p>
                                <p className={`text-xl font-bold ${totalCobrosEstesMes - totalGastosEsteMes >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                    $ {fmt(totalCobrosEstesMes - totalGastosEsteMes)}
                                </p>
                            </div>
                        </div>

                        {/* Últimos cobros */}
                        {payments.length > 0 && (
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase mb-3">Últimos cobros</p>
                                <div className="space-y-2">
                                    {payments.slice(0, 3).map(p => (
                                        <div key={p.id} className="flex justify-between items-center text-sm">
                                            <div>
                                                <span className="font-medium text-slate-800">{p.lease.tenant.fullName}</span>
                                                <span className="text-slate-400 text-xs ml-2">{format(new Date(p.paidAt), 'dd/MM/yy', { locale: es })}</span>
                                            </div>
                                            <span className="font-bold text-emerald-600">$ {fmt(p.amountUYU)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {payments.length === 0 && expenses.length === 0 && (
                            <p className="text-slate-400 text-sm text-center py-4">
                                Registrá cobros y gastos para ver la rentabilidad aquí.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

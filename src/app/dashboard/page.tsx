'use client'

import { useEffect, useState } from 'react'
import {
    BanknotesIcon,
    BuildingOffice2Icon,
    UsersIcon,
    DocumentTextIcon,
    ClockIcon,
} from '@heroicons/react/24/outline'

interface Stats {
    propertiesCount: number
    tenantsCount: number
    activeLeasesCount: number
    totalRentUYU: number
    expiring30: number
    expiring60: number
    expiring90: number
}

function fmt(n: number) {
    return n.toLocaleString('es-UY')
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(r => r.json())
            .then(setStats)
            .catch(console.error)
    }, [])

    const metrics = stats ? [
        {
            title: 'Alquiler Mensual Total',
            value: `$ ${fmt(stats.totalRentUYU)}`,
            subtitle: 'UYU en contratos activos',
            icon: BanknotesIcon,
            color: 'bg-emerald-100 text-emerald-600',
        },
        {
            title: 'Contratos Activos',
            value: String(stats.activeLeasesCount),
            subtitle: 'alquileres vigentes',
            icon: DocumentTextIcon,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Propiedades',
            value: String(stats.propertiesCount),
            subtitle: 'inmuebles registrados',
            icon: BuildingOffice2Icon,
            color: 'bg-indigo-100 text-indigo-600',
        },
        {
            title: 'Inquilinos',
            value: String(stats.tenantsCount),
            subtitle: 'en la base de datos',
            icon: UsersIcon,
            color: 'bg-amber-100 text-amber-600',
        },
    ] : []

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
                                <div className={`p-2 rounded-xl ${m.color}`}>
                                    <m.icon className="w-6 h-6" />
                                </div>
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
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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

                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                        <ClockIcon className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 text-sm">
                            El módulo de rentabilidad por propiedad estará disponible<br />cuando registres pagos y gastos en los contratos.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-6 w-full max-w-sm text-left">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs text-slate-500 font-medium">Total propiedades</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.propertiesCount}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs text-slate-500 font-medium">Total inquilinos</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.tenantsCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

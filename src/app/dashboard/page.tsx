import {
    BanknotesIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ClockIcon
} from '@heroicons/react/24/outline'

const metrics = [
    {
        title: 'Cobranzas del Mes',
        value: '$ 124.500',
        subtitle: 'UYU recaudados',
        icon: BanknotesIcon,
        color: 'bg-emerald-100 text-emerald-600',
    },
    {
        title: 'Morosidad',
        value: '$ 45.000',
        subtitle: '3 alquileres atrasados',
        icon: ExclamationTriangleIcon,
        color: 'bg-red-100 text-red-600',
    },
    {
        title: 'Depósitos Pendientes',
        value: '2',
        subtitle: '$ 60.000 por integrar',
        icon: ClockIcon,
        color: 'bg-amber-100 text-amber-600',
    },
    {
        title: 'Contratos por Vencer',
        value: '4',
        subtitle: 'En los próximos 90 días',
        icon: DocumentTextIcon,
        color: 'bg-blue-100 text-blue-600',
    }
]

export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Principal</h1>
                <p className="text-slate-500 mt-1">Resumen general de tu cartera de propiedades.</p>
            </header>

            {/* Metrics Grid */}
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

            {/* Breakdowns and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Vencimientos 30/60/90 */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                        Próximos Vencimientos
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Contratos</span>
                    </h3>
                    <div className="space-y-4">
                        {/* 30 days */}
                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50/50 border border-red-100">
                            <span className="text-sm font-semibold text-red-700">30 Días</span>
                            <span className="bg-white text-red-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">1</span>
                        </div>
                        {/* 60 days */}
                        <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                            <span className="text-sm font-semibold text-orange-700">60 Días</span>
                            <span className="bg-white text-orange-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">2</span>
                        </div>
                        {/* 90 days */}
                        <div className="flex justify-between items-center p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                            <span className="text-sm font-semibold text-amber-700">90 Días</span>
                            <span className="bg-white text-amber-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">1</span>
                        </div>
                    </div>
                </div>

                {/* Rentabilidad Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Rentabilidad Neta por Propiedad</h3>
                        <select className="text-sm border-slate-200 rounded-lg text-slate-600 bg-slate-50 py-1 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500">
                            <option>Este mes</option>
                            <option>Últimos 3 meses</option>
                            <option>YTD</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase px-4 py-3 rounded-t-lg">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-tl-lg">Propiedad</th>
                                    <th className="px-4 py-3 font-medium">Ingresos</th>
                                    <th className="px-4 py-3 font-medium">Gastos</th>
                                    <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Rentabilidad Neta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-4 py-4 font-medium text-slate-900">Edificio Bulevar</td>
                                    <td className="px-4 py-4 text-emerald-600">$ 180.000</td>
                                    <td className="px-4 py-4 text-red-500">$ 45.000</td>
                                    <td className="px-4 py-4 font-bold text-slate-900 text-right">$ 135.000</td>
                                </tr>
                                <tr className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-4 py-4 font-medium text-slate-900">Casas Prado</td>
                                    <td className="px-4 py-4 text-emerald-600">$ 95.000</td>
                                    <td className="px-4 py-4 text-red-500">$ 10.000</td>
                                    <td className="px-4 py-4 font-bold text-slate-900 text-right">$ 85.000</td>
                                </tr>
                                <tr className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-4 py-4 font-medium text-slate-900">Local Centro</td>
                                    <td className="px-4 py-4 text-emerald-600">$ 40.000</td>
                                    <td className="px-4 py-4 text-red-500">$ 0</td>
                                    <td className="px-4 py-4 font-bold text-slate-900 text-right">$ 40.000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}

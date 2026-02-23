'use client'

import { Users, UserPlus, Phone, Mail, FileText } from 'lucide-react'

const tenants = [
    { id: '1', name: 'María Clara Rodríguez', doc: '4.567.890-1', phone: '099 123 456', email: 'maria@example.com', leases: 1 },
    { id: '2', name: 'Juan Pérez Silva', doc: '3.123.456-7', phone: '098 765 432', email: 'juan@example.com', leases: 1 },
    { id: '3', name: 'Esteban Etcheverry', doc: '1.234.567-8', phone: '091 112 233', email: 'esteban@example.com', leases: 0 },
]

export default function TenantsPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-24">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        Inquilinos
                    </h1>
                    <p className="text-slate-500 mt-1">Carga y gestiona la base de datos de inquilinos.</p>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2 shrink-0">
                    <UserPlus className="w-5 h-5" />
                    Registrar Inquilino
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase rounded-t-lg">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nombre / Documento</th>
                                <th className="px-6 py-4 font-medium">Contacto</th>
                                <th className="px-6 py-4 font-medium">Contratos</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenants.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors group">

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold tracking-tight">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{tenant.name}</div>
                                                <div className="text-xs text-slate-500">{tenant.doc}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Phone className="w-3 h-3" />
                                                <span>{tenant.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Mail className="w-3 h-3" />
                                                <span>{tenant.email}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none shrink-0 inline-flex
                         ${tenant.leases > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            {tenant.leases} {tenant.leases === 1 ? 'Activo' : 'Activos'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors flex items-center justify-end w-full gap-1">
                                            <FileText className="w-4 h-4" />
                                            Ficha
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

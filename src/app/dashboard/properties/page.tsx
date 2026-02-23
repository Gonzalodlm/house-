import { Building2, Plus, MapPin } from 'lucide-react'

const properties = [
    { id: '1', name: 'Edificio Bulevar', address: 'Bulevar Artigas 1234', city: 'Montevideo', units: 10, status: 'Active' },
    { id: '2', name: 'Casas Prado', address: 'Avenida Millán 4567', city: 'Montevideo', units: 3, status: 'Active' },
    { id: '3', name: 'Local Centro', address: '18 de Julio 890', city: 'Montevideo', units: 1, status: 'Active' },
]

export default function PropertiesPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        Propiedades
                    </h1>
                    <p className="text-slate-500 mt-1">Gestiona los inmuebles, edificios y locales.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nueva Propiedad
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                    <div key={prop.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover-lift relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-slate-800">{prop.name}</h2>
                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                                Activa
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-2 text-slate-500">
                                <MapPin className="w-5 h-5 shrink-0 text-slate-400" />
                                <span className="text-sm line-clamp-2">{prop.address}, {prop.city}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm">
                                <span className="font-bold text-slate-900">{prop.units}</span>
                                <span className="text-slate-500 ml-1">Unidades</span>
                            </div>
                            <button className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">
                                Ver Detalles &rarr;
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}

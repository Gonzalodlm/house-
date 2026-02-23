'use client'

import { useEffect, useState } from 'react'
import { Building2, Plus, MapPin, X, Home } from 'lucide-react'

interface Property {
    id: string
    name: string
    address: string
    city: string
    notes?: string
    _count: { units: number }
}

interface Unit {
    id: string
    unitLabel: string
    propertyId: string
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)

    // Modal nueva propiedad
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', address: '', city: 'Montevideo', notes: '' })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Modal nueva unidad
    const [showUnitModal, setShowUnitModal] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [unitLabel, setUnitLabel] = useState('')
    const [savingUnit, setSavingUnit] = useState(false)

    useEffect(() => {
        fetch('/api/properties')
            .then(r => r.json())
            .then(setProperties)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setFormError(null)
        const res = await fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            const created = await res.json()
            setProperties(prev => [...prev, created])
            setShowModal(false)
            setForm({ name: '', address: '', city: 'Montevideo', notes: '' })
        } else {
            const data = await res.json()
            setFormError(data.error || 'Error al guardar')
        }
        setSaving(false)
    }

    const handleAddUnit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProperty) return
        setSavingUnit(true)
        const res = await fetch('/api/units', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propertyId: selectedProperty.id, unitLabel }),
        })
        if (res.ok) {
            setProperties(prev =>
                prev.map(p =>
                    p.id === selectedProperty.id
                        ? { ...p, _count: { units: p._count.units + 1 } }
                        : p
                )
            )
            setShowUnitModal(false)
            setUnitLabel('')
            setSelectedProperty(null)
        }
        setSavingUnit(false)
    }

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
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Propiedad
                </button>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-48 animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-2/3 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : properties.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-100 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hay propiedades registradas.</p>
                    <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 font-semibold hover:underline text-sm">
                        Agregar la primera propiedad →
                    </button>
                </div>
            ) : (
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
                                {prop.notes && (
                                    <p className="text-xs text-slate-400 italic">{prop.notes}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="text-sm">
                                    <span className="font-bold text-slate-900">{prop._count.units}</span>
                                    <span className="text-slate-500 ml-1">Unidades</span>
                                </div>
                                <button
                                    onClick={() => { setSelectedProperty(prop); setShowUnitModal(true) }}
                                    className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors flex items-center gap-1"
                                >
                                    <Home className="w-4 h-4" />
                                    Agregar Unidad
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Nueva Propiedad */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Nueva Propiedad</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Edificio Bulevar"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
                                <input
                                    required
                                    value={form.address}
                                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Bulevar Artigas 1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad *</label>
                                <input
                                    required
                                    value={form.city}
                                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Montevideo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Observaciones opcionales..."
                                />
                            </div>
                            {formError && <p className="text-red-600 text-sm">{formError}</p>}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Nueva Unidad */}
            {showUnitModal && selectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Agregar Unidad</h2>
                            <button onClick={() => setShowUnitModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Propiedad: <span className="font-semibold text-slate-700">{selectedProperty.name}</span></p>
                        <form onSubmit={handleAddUnit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Etiqueta de Unidad *</label>
                                <input
                                    required
                                    value={unitLabel}
                                    onChange={e => setUnitLabel(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Apto 101, Local A, Piso 2..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUnitModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingUnit}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {savingUnit ? 'Guardando...' : 'Agregar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

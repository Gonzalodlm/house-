'use client'

import { useEffect, useState } from 'react'
import { ReceiptIcon, Plus, X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Expense {
    id: string
    date: string
    category: string
    description?: string
    amountUYU: number
    vendor?: string
    property: { name: string }
}

interface Property { id: string; name: string }

const CATEGORIES = ['MANTENIMIENTO', 'SERVICIOS', 'SEGURO', 'ADMINISTRACIÓN', 'IMPUESTOS', 'OTRO']

function fmt(n: number) { return n.toLocaleString('es-UY') }

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [properties, setProperties] = useState<Property[]>([])
    const [form, setForm] = useState({ propertyId: '', date: '', category: 'MANTENIMIENTO', description: '', amountUYU: '', vendor: '' })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        fetch('/api/expenses')
            .then(r => r.json())
            .then(setExpenses)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const openModal = async () => {
        const p = await fetch('/api/properties').then(r => r.json())
        setProperties(p)
        setForm({ propertyId: '', date: new Date().toISOString().slice(0, 10), category: 'MANTENIMIENTO', description: '', amountUYU: '', vendor: '' })
        setShowModal(true)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true); setFormError(null)
        const res = await fetch('/api/expenses', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            const created = await res.json()
            setExpenses(prev => [created, ...prev])
            setShowModal(false)
        } else {
            const data = await res.json()
            setFormError(data.error || 'Error al guardar')
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!deletingExpense) return
        setDeleteLoading(true)
        const res = await fetch(`/api/expenses/${deletingExpense.id}`, { method: 'DELETE' })
        if (res.ok) {
            setExpenses(prev => prev.filter(e => e.id !== deletingExpense.id))
            setDeletingExpense(null)
        }
        setDeleteLoading(false)
    }

    const totalThisMonth = expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth() && new Date(e.date).getFullYear() === new Date().getFullYear())
        .reduce((sum, e) => sum + e.amountUYU, 0)

    const catColors: Record<string, string> = {
        MANTENIMIENTO: 'bg-orange-100 text-orange-700',
        SERVICIOS: 'bg-blue-100 text-blue-700',
        SEGURO: 'bg-purple-100 text-purple-700',
        ADMINISTRACIÓN: 'bg-slate-100 text-slate-700',
        IMPUESTOS: 'bg-red-100 text-red-700',
        OTRO: 'bg-gray-100 text-gray-700',
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <ReceiptIcon className="w-8 h-8 text-red-500" />Gastos
                    </h1>
                    <p className="text-slate-500 mt-1">Registra gastos y mantenimiento por propiedad.</p>
                </div>
                <button onClick={openModal}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />Registrar Gasto
                </button>
            </header>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Total gastos</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{expenses.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Este mes</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">$ {fmt(totalThisMonth)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Total acumulado</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">$ {fmt(expenses.reduce((s, e) => s + e.amountUYU, 0))}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : expenses.length === 0 ? (
                    <div className="p-16 text-center">
                        <ReceiptIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No hay gastos registrados.</p>
                        <button onClick={openModal} className="mt-4 text-red-500 font-semibold hover:underline text-sm">Registrar primer gasto →</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Fecha</th>
                                    <th className="px-6 py-4 font-medium">Propiedad / Categoría</th>
                                    <th className="px-6 py-4 font-medium">Descripción</th>
                                    <th className="px-6 py-4 font-medium text-right">Monto</th>
                                    <th className="px-6 py-4 font-medium text-right">Acc.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenses.map(e => (
                                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {format(new Date(e.date), 'dd/MM/yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{e.property.name}</div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[e.category] || 'bg-gray-100 text-gray-700'}`}>
                                                {e.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{e.description || '—'}</div>
                                            {e.vendor && <div className="text-xs text-slate-400">{e.vendor}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-red-500">$ {fmt(e.amountUYU)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setDeletingExpense(e)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Registrar Gasto */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Registrar Gasto</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Propiedad *</label>
                                <select required value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400">
                                    <option value="">Seleccionar propiedad...</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                                    <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto (UYU) *</label>
                                    <input required type="number" min="0" value={form.amountUYU} onChange={e => setForm(f => ({ ...f, amountUYU: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="5000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Ej: Reparación de cañería" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                                <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Nombre del proveedor" />
                            </div>
                            {formError && <p className="text-red-600 text-sm">{formError}</p>}
                            {properties.length === 0 && <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">No hay propiedades registradas.</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                                <button type="submit" disabled={saving || properties.length === 0}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-60">
                                    {saving ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Eliminar gasto</h2>
                        <p className="text-slate-600 text-sm mb-6">
                            ¿Eliminar el gasto de $ {fmt(deletingExpense.amountUYU)} en {deletingExpense.property.name}?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingExpense(null)}
                                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                            <button onClick={handleDelete} disabled={deleteLoading}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-60">
                                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

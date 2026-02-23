'use client'

import { useEffect, useState } from 'react'
import { BanknoteIcon, Plus, X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Payment {
    id: string
    paidAt: string
    amountUYU: number
    method: string
    reference?: string
    notes?: string
    lease: {
        tenant: { fullName: string }
        unit: { unitLabel: string; property: { name: string } }
    }
}

interface Lease {
    id: string
    tenant: { fullName: string }
    unit: { unitLabel: string; property: { name: string } }
}

const METHODS = ['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'OTRO']

function fmt(n: number) { return n.toLocaleString('es-UY') }

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [leases, setLeases] = useState<Lease[]>([])
    const [form, setForm] = useState({ leaseId: '', paidAt: '', amountUYU: '', method: 'EFECTIVO', reference: '', notes: '' })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        fetch('/api/payments')
            .then(r => r.json())
            .then(setPayments)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const openModal = async () => {
        const l = await fetch('/api/leases').then(r => r.json())
        setLeases(l)
        setForm({ leaseId: '', paidAt: new Date().toISOString().slice(0, 10), amountUYU: '', method: 'EFECTIVO', reference: '', notes: '' })
        setShowModal(true)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true); setFormError(null)
        const res = await fetch('/api/payments', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            const created = await res.json()
            setPayments(prev => [created, ...prev])
            setShowModal(false)
        } else {
            const data = await res.json()
            setFormError(data.error || 'Error al guardar')
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!deletingPayment) return
        setDeleteLoading(true)
        const res = await fetch(`/api/payments/${deletingPayment.id}`, { method: 'DELETE' })
        if (res.ok) {
            setPayments(prev => prev.filter(p => p.id !== deletingPayment.id))
            setDeletingPayment(null)
        }
        setDeleteLoading(false)
    }

    const totalThisMonth = payments
        .filter(p => new Date(p.paidAt).getMonth() === new Date().getMonth() && new Date(p.paidAt).getFullYear() === new Date().getFullYear())
        .reduce((sum, p) => sum + p.amountUYU, 0)

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <BanknoteIcon className="w-8 h-8 text-emerald-600" />Cobros
                    </h1>
                    <p className="text-slate-500 mt-1">Registra y gestiona los pagos de alquiler.</p>
                </div>
                <button onClick={openModal}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />Registrar Cobro
                </button>
            </header>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Total cobros</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Este mes</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">$ {fmt(totalThisMonth)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Total acumulado</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">$ {fmt(payments.reduce((s, p) => s + p.amountUYU, 0))}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : payments.length === 0 ? (
                    <div className="p-16 text-center">
                        <BanknoteIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No hay cobros registrados.</p>
                        <button onClick={openModal} className="mt-4 text-emerald-600 font-semibold hover:underline text-sm">Registrar primer cobro →</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Fecha</th>
                                    <th className="px-6 py-4 font-medium">Contrato</th>
                                    <th className="px-6 py-4 font-medium">Método</th>
                                    <th className="px-6 py-4 font-medium text-right">Monto</th>
                                    <th className="px-6 py-4 font-medium text-right">Acc.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {format(new Date(p.paidAt), 'dd/MM/yyyy', { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{p.lease.tenant.fullName}</div>
                                            <div className="text-xs text-slate-400">{p.lease.unit.property.name} — {p.lease.unit.unitLabel}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-medium">{p.method}</span>
                                            {p.reference && <div className="text-xs text-slate-400 mt-1">{p.reference}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-700">$ {fmt(p.amountUYU)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setDeletingPayment(p)}
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

            {/* Modal Registrar Cobro */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Registrar Cobro</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contrato *</label>
                                <select required value={form.leaseId} onChange={e => setForm(f => ({ ...f, leaseId: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    <option value="">Seleccionar contrato...</option>
                                    {leases.map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.tenant.fullName} — {l.unit.property.name} {l.unit.unitLabel}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de pago *</label>
                                    <input required type="date" value={form.paidAt} onChange={e => setForm(f => ({ ...f, paidAt: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto (UYU) *</label>
                                    <input required type="number" min="0" value={form.amountUYU} onChange={e => setForm(f => ({ ...f, amountUYU: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="25000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Método *</label>
                                <select required value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Referencia / Comprobante</label>
                                <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Número de transferencia, etc." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                            </div>
                            {formError && <p className="text-red-600 text-sm">{formError}</p>}
                            {leases.length === 0 && <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">No hay contratos activos. Primero creá un contrato.</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                                <button type="submit" disabled={saving || leases.length === 0}
                                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-60">
                                    {saving ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Eliminar cobro</h2>
                        <p className="text-slate-600 text-sm mb-6">
                            ¿Eliminar el cobro de $ {fmt(deletingPayment.amountUYU)} de {deletingPayment.lease.tenant.fullName}?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingPayment(null)}
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

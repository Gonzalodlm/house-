'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, Phone, Mail, FileText, X, Pencil, Trash2 } from 'lucide-react'

interface Tenant {
    id: string
    fullName: string
    documentId?: string
    phone?: string
    email?: string
    notes?: string
    _count: { leases: number }
}

const EMPTY_FORM = { fullName: '', documentId: '', email: '', phone: '', notes: '' }

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
    const [editForm, setEditForm] = useState(EMPTY_FORM)
    const [editSaving, setEditSaving] = useState(false)
    const [editError, setEditError] = useState<string | null>(null)

    const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        fetch('/api/tenants')
            .then(r => r.json())
            .then(setTenants)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true); setFormError(null)
        const res = await fetch('/api/tenants', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            const created = await res.json()
            setTenants(prev => [...prev, created])
            setShowModal(false); setForm(EMPTY_FORM)
        } else {
            const data = await res.json()
            setFormError(data.error || 'Error al guardar')
        }
        setSaving(false)
    }

    const openEdit = (t: Tenant) => {
        setEditingTenant(t)
        setEditForm({ fullName: t.fullName, documentId: t.documentId || '', email: t.email || '', phone: t.phone || '', notes: t.notes || '' })
        setEditError(null)
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTenant) return
        setEditSaving(true); setEditError(null)
        const res = await fetch(`/api/tenants/${editingTenant.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        })
        if (res.ok) {
            const updated = await res.json()
            setTenants(prev => prev.map(t => t.id === updated.id ? updated : t))
            setEditingTenant(null)
        } else {
            const data = await res.json()
            setEditError(data.error || 'Error al guardar')
        }
        setEditSaving(false)
    }

    const handleDelete = async () => {
        if (!deletingTenant) return
        setDeleteLoading(true)
        const res = await fetch(`/api/tenants/${deletingTenant.id}`, { method: 'DELETE' })
        if (res.ok) {
            setTenants(prev => prev.filter(t => t.id !== deletingTenant.id))
            setDeletingTenant(null)
        }
        setDeleteLoading(false)
    }

    const FormModal = ({ f, setF, error, onSubmit, onCancel, isSaving, title, btnLabel }: {
        f: typeof EMPTY_FORM
        setF: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
        error: string | null; onSubmit: (e: React.FormEvent) => void; onCancel: () => void
        isSaving: boolean; title: string; btnLabel: string
    }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
                        <input required value={f.fullName} onChange={e => setF(p => ({ ...p, fullName: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: María Clara Rodríguez" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cédula / Documento</label>
                        <input value={f.documentId} onChange={e => setF(p => ({ ...p, documentId: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 4.567.890-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                            <input value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="099 123 456" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="correo@ejemplo.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                        <textarea value={f.notes} onChange={e => setF(p => ({ ...p, notes: e.target.value }))}
                            rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Observaciones opcionales..." />
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onCancel}
                            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={isSaving}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60">
                            {isSaving ? 'Guardando...' : btnLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-24">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />Inquilinos
                    </h1>
                    <p className="text-slate-500 mt-1">Carga y gestiona la base de datos de inquilinos.</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2 shrink-0">
                    <UserPlus className="w-5 h-5" />Registrar Inquilino
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : tenants.length === 0 ? (
                    <div className="p-16 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No hay inquilinos registrados.</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 font-semibold hover:underline text-sm">
                            Registrar el primer inquilino →
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nombre / Documento</th>
                                    <th className="px-6 py-4 font-medium">Contacto</th>
                                    <th className="px-6 py-4 font-medium">Contratos</th>
                                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenants.map(tenant => (
                                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                    {tenant.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{tenant.fullName}</div>
                                                    <div className="text-xs text-slate-500">{tenant.documentId || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {tenant.phone && <div className="flex items-center gap-2 text-slate-500"><Phone className="w-3 h-3" />{tenant.phone}</div>}
                                                {tenant.email && <div className="flex items-center gap-2 text-slate-500"><Mail className="w-3 h-3" />{tenant.email}</div>}
                                                {!tenant.phone && !tenant.email && <span className="text-slate-400">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${tenant._count.leases > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                <FileText className="w-3 h-3" />{tenant._count.leases} {tenant._count.leases === 1 ? 'contrato' : 'contratos'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(tenant)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeletingTenant(tenant)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && <FormModal f={form} setF={setForm} error={formError} onSubmit={handleCreate}
                onCancel={() => setShowModal(false)} isSaving={saving} title="Registrar Inquilino" btnLabel="Registrar" />}

            {editingTenant && <FormModal f={editForm} setF={setEditForm} error={editError} onSubmit={handleEdit}
                onCancel={() => setEditingTenant(null)} isSaving={editSaving} title="Editar Inquilino" btnLabel="Guardar cambios" />}

            {deletingTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Eliminar inquilino</h2>
                        <p className="text-slate-600 text-sm mb-6">
                            ¿Eliminar a <span className="font-semibold">{deletingTenant.fullName}</span>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingTenant(null)}
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

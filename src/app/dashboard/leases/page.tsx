'use client'

import { useEffect, useState } from 'react'
import { FileUp, FileText, CheckCircle2, ChevronRight, Check, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Lease {
    id: string
    rentAmount: number
    dueDayOfMonth: number
    startDate: string
    endDate: string
    status: string
    currency: string
    tenant: { fullName: string }
    unit: { unitLabel: string; property: { name: string } }
}

interface Tenant { id: string; fullName: string }
interface Unit { id: string; unitLabel: string; property: { name: string } }

function fmt(n: number) { return n.toLocaleString('es-UY') }

export default function LeasesPage() {
    const [leases, setLeases] = useState<Lease[]>([])
    const [loading, setLoading] = useState(true)

    // PDF extraction
    const [file, setFile] = useState<File | null>(null)
    const [extracting, setExtracting] = useState(false)
    const [proposed, setProposed] = useState<any | null>(null)
    const [pdfError, setPdfError] = useState<string | null>(null)
    const [confirmed, setConfirmed] = useState(false)

    // Modal nuevo contrato manual
    const [showModal, setShowModal] = useState(false)
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [units, setUnits] = useState<Unit[]>([])
    const [form, setForm] = useState({
        tenantId: '', unitId: '', startDate: '', endDate: '',
        rentAmount: '', dueDayOfMonth: '10', currency: 'UYU',
    })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/leases')
            .then(r => r.json())
            .then(setLeases)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const openModal = async () => {
        const [t, u] = await Promise.all([
            fetch('/api/tenants').then(r => r.json()),
            fetch('/api/units').then(r => r.json()),
        ])
        setTenants(t)
        setUnits(u)
        setShowModal(true)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setFormError(null)
        const res = await fetch('/api/leases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        if (res.ok) {
            const created = await res.json()
            setLeases(prev => [created, ...prev])
            setShowModal(false)
            setForm({ tenantId: '', unitId: '', startDate: '', endDate: '', rentAmount: '', dueDayOfMonth: '10', currency: 'UYU' })
        } else {
            const data = await res.json()
            setFormError(data.error || 'Error al guardar')
        }
        setSaving(false)
    }

    const handleUpload = async () => {
        if (!file) return
        setExtracting(true)
        setPdfError(null)
        const formData = new FormData()
        formData.append('contract', file)
        try {
            const res = await fetch('/api/extract', { method: 'POST', body: formData })
            if (!res.ok) throw new Error('Error al procesar el PDF')
            const result = await res.json()
            setProposed(result.proposedFields)
        } catch (err: any) {
            setPdfError(err.message)
        } finally {
            setExtracting(false)
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-24">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        Contratos
                    </h1>
                    <p className="text-slate-500 mt-1">Gestiona alquileres, garantías y extracciones de PDF.</p>
                </div>
                <button
                    onClick={openModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Contrato
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload & Extraction Widget */}
                <div className="lg:col-span-1 border border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-blue-500" />
                        Subir Contrato PDF
                    </h3>
                    <div className="space-y-4">
                        <div className={`p-6 border-2 border-dashed rounded-xl transition-colors text-center cursor-pointer ${file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}`}>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                id="pdf-upload"
                                onChange={(e) => { setFile(e.target.files?.[0] || null); setProposed(null); setConfirmed(false) }}
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer block">
                                {file ? (
                                    <div className="text-blue-700 font-medium break-words">{file.name}</div>
                                ) : (
                                    <>
                                        <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                        <div className="text-slate-600 font-medium">Seleccionar PDF</div>
                                    </>
                                )}
                            </label>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={!file || extracting}
                            className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {extracting ? 'Extrayendo...' : 'Procesar Contrato'}
                        </button>
                        {pdfError && <p className="text-red-500 text-sm">{pdfError}</p>}
                    </div>

                    {proposed && !confirmed && (
                        <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-2">
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                                Datos extraídos — revisá y corregí si es necesario
                            </h4>
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                                <div>
                                    <span className="block text-slate-500 text-xs font-semibold mb-1">Monto de Alquiler</span>
                                    <input type="text" defaultValue={proposed.rentAmount || ''} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs font-semibold mb-1">Día de Vencimiento</span>
                                    <input type="text" defaultValue={proposed.dueDayOfMonth} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs font-semibold mb-1">CI Encontrada</span>
                                    <input type="text" defaultValue={proposed.tenantDocumentId} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg" />
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs font-semibold mb-1">Garantía</span>
                                    <select className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg" defaultValue={proposed.guaranteeType}>
                                        <option value="ANDA">ANDA</option>
                                        <option value="DEPOSIT">Depósito</option>
                                        <option value="INSURANCE">Seguro</option>
                                        <option value="OTHER">Otro</option>
                                    </select>
                                </div>
                                <p className="text-xs text-slate-400 pt-1">Para guardar, usá el botón "Nuevo Contrato" con estos datos.</p>
                            </div>
                        </div>
                    )}

                    {confirmed && (
                        <div className="mt-6 pt-6 border-t border-emerald-100 animate-in fade-in">
                            <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                Contrato guardado correctamente.
                            </div>
                        </div>
                    )}
                </div>

                {/* Leases List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
                            <span>Alquileres</span>
                            <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs">Total: {leases.length}</span>
                        </div>

                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : leases.length === 0 ? (
                            <div className="p-16 text-center">
                                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No hay contratos registrados.</p>
                                <button onClick={openModal} className="mt-3 text-blue-600 font-semibold hover:underline text-sm">
                                    Crear el primer contrato →
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {leases.map((lease) => (
                                    <div key={lease.id} className="p-6 hover:bg-slate-50/80 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-slate-900">
                                                    {lease.unit.property.name} — {lease.unit.unitLabel}
                                                </h3>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">
                                                    {lease.status}
                                                </span>
                                            </div>
                                            <div className="text-slate-500 text-sm font-medium">Inquilino: {lease.tenant.fullName}</div>
                                            <div className="text-slate-400 text-xs mt-1">
                                                Vence día {lease.dueDayOfMonth} · Fin: {format(new Date(lease.endDate), 'dd/MM/yyyy', { locale: es })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-slate-900 font-bold">$ {fmt(lease.rentAmount)}</div>
                                                <div className="text-slate-400 text-xs">{lease.currency}</div>
                                            </div>
                                            <div className="text-slate-400 bg-white border border-slate-200 p-2 rounded-xl">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Nuevo Contrato */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Nuevo Contrato</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Inquilino *</label>
                                <select
                                    required
                                    value={form.tenantId}
                                    onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar inquilino...</option>
                                    {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Unidad *</label>
                                <select
                                    required
                                    value={form.unitId}
                                    onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar unidad...</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.property.name} — {u.unitLabel}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha inicio *</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.startDate}
                                        onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha fin *</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.endDate}
                                        onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto alquiler *</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.rentAmount}
                                        onChange={e => setForm(f => ({ ...f, rentAmount: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="25000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Día vencimiento *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max="28"
                                        value={form.dueDayOfMonth}
                                        onChange={e => setForm(f => ({ ...f, dueDayOfMonth: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label>
                                <select
                                    value={form.currency}
                                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="UYU">UYU — Peso Uruguayo</option>
                                    <option value="USD">USD — Dólar</option>
                                </select>
                            </div>
                            {formError && <p className="text-red-600 text-sm">{formError}</p>}
                            {tenants.length === 0 && (
                                <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                                    No hay inquilinos registrados. Primero registrá un inquilino en la sección Inquilinos.
                                </p>
                            )}
                            {units.length === 0 && (
                                <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                                    No hay unidades registradas. Primero agregá una unidad en la sección Propiedades.
                                </p>
                            )}
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
                                    disabled={saving || tenants.length === 0 || units.length === 0}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {saving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar Contrato</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

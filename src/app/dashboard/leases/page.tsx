'use client'

import { useState } from 'react'
import { FileUp, Eye, FileText, CheckCircle2, ChevronRight, Check } from 'lucide-react'

// Dummy data
const leases = [
    { id: '1', tenant: 'María Clara Rodríguez', unit: 'Bulevar 302', status: 'ACTIVE', rent: '25.000', end: '2024-10-31' },
    { id: '2', tenant: 'Juan Pérez Silva', unit: 'Casas Prado 2', status: 'ACTIVE', rent: '22.000', end: '2025-05-15' },
]

export default function LeasesPage() {
    const [file, setFile] = useState<File | null>(null)
    const [extracting, setExtracting] = useState(false)
    const [proposed, setProposed] = useState<any | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [confirmed, setConfirmed] = useState(false)

    const handleUpload = async () => {
        if (!file) return
        setExtracting(true)
        setError(null)

        const formData = new FormData()
        formData.append('contract', file)

        try {
            const res = await fetch('/api/extract', {
                method: 'POST',
                body: formData,
            })
            if (!res.ok) throw new Error('Failed to extract PDF data')
            const result = await res.json()
            setProposed(result.proposedFields)
        } catch (err: any) {
            setError(err.message)
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
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Upload & Extraction Widget */}
                <div className="lg:col-span-1 border border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-blue-500" />
                        Subir Contrato
                    </h3>

                    <div className="space-y-4">
                        <div className={`p-6 border-2 border-dashed rounded-xl transition-colors text-center cursor-pointer ${file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}`}>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                id="pdf-upload"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
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
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    {/* Review Findings */}
                    {proposed && !confirmed && (
                        <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-2">
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-emerald-500" />
                                Validar Datos
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

                                <button
                                    onClick={() => setConfirmed(true)}
                                    className="w-full mt-2 bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Confirmar y Guardar
                                </button>
                            </div>
                        </div>
                    )}

                    {confirmed && (
                        <div className="mt-6 pt-6 border-t border-emerald-100 animate-in fade-in">
                            <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                Alquiler creado satisfactoriamente a partir de PDF.
                            </div>
                        </div>
                    )}
                </div>

                {/* Leases List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
                            <span>Alquileres Activos</span>
                            <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs">Total: {leases.length}</span>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {leases.map((lease) => (
                                <div key={lease.id} className="p-6 hover:bg-slate-50/80 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-slate-900">{lease.unit}</h3>
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">
                                                {lease.status}
                                            </span>
                                        </div>
                                        <div className="text-slate-500 text-sm font-medium">Inquilino: {lease.tenant}</div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-slate-900 font-bold">$ {lease.rent}</div>
                                            <div className="text-slate-400 text-xs">Vence: {lease.end}</div>
                                        </div>

                                        <button className="text-slate-400 group-hover:text-blue-600 transition-colors bg-white border border-slate-200 group-hover:border-blue-200 p-2 rounded-xl group-hover:bg-blue-50">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const { searchParams } = new URL(req.url)
        const leaseId = searchParams.get('leaseId')
        const payments = await prisma.payment.findMany({
            where: { orgId: session.orgId, ...(leaseId ? { leaseId } : {}) },
            include: { lease: { include: { tenant: true, unit: { include: { property: true } } } } },
            orderBy: { paidAt: 'desc' },
        })
        return NextResponse.json(payments)
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const { leaseId, paidAt, amountUYU, method, reference, notes } = await req.json()
        if (!leaseId || !paidAt || !amountUYU || !method) {
            return NextResponse.json({ error: 'Contrato, fecha, monto y método son requeridos' }, { status: 400 })
        }
        const payment = await prisma.payment.create({
            data: {
                orgId: session.orgId,
                leaseId,
                paidAt: new Date(paidAt),
                amountUYU: parseFloat(String(amountUYU)),
                method,
                reference,
                notes,
            },
            include: { lease: { include: { tenant: true, unit: { include: { property: true } } } } },
        })
        return NextResponse.json(payment, { status: 201 })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

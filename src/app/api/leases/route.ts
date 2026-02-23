import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const leases = await prisma.lease.findMany({
            where: { orgId: session.orgId },
            include: {
                tenant: true,
                unit: { include: { property: true } },
            },
            orderBy: { startDate: 'desc' },
        })

        return NextResponse.json(leases)
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { unitId, tenantId, startDate, endDate, rentAmount, dueDayOfMonth, currency, notes } = await req.json()

        if (!unitId || !tenantId || !startDate || !endDate || !rentAmount || !dueDayOfMonth) {
            return NextResponse.json({ error: 'Todos los campos obligatorios son requeridos' }, { status: 400 })
        }

        const lease = await prisma.lease.create({
            data: {
                orgId: session.orgId,
                unitId,
                tenantId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                rentAmount: parseFloat(String(rentAmount)),
                dueDayOfMonth: parseInt(String(dueDayOfMonth)),
                currency: currency || 'UYU',
                status: 'ACTIVE',
                notes,
            },
            include: {
                tenant: true,
                unit: { include: { property: true } },
            },
        })

        return NextResponse.json(lease, { status: 201 })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

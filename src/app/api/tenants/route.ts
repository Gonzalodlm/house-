import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const tenants = await prisma.tenant.findMany({
            where: { orgId: session.orgId },
            include: { _count: { select: { leases: true } } },
            orderBy: { fullName: 'asc' },
        })

        return NextResponse.json(tenants)
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { fullName, documentId, email, phone, notes } = await req.json()
        if (!fullName) {
            return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
        }

        const tenant = await prisma.tenant.create({
            data: { orgId: session.orgId, fullName, documentId, email, phone, notes },
            include: { _count: { select: { leases: true } } },
        })

        return NextResponse.json(tenant, { status: 201 })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

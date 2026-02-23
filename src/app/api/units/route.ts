import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const propertyId = searchParams.get('propertyId')

        const units = await prisma.unit.findMany({
            where: {
                orgId: session.orgId,
                ...(propertyId ? { propertyId } : {}),
            },
            include: { property: true },
            orderBy: [{ property: { name: 'asc' } }, { unitLabel: 'asc' }],
        })

        return NextResponse.json(units)
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { propertyId, unitLabel, notes } = await req.json()
        if (!propertyId || !unitLabel) {
            return NextResponse.json({ error: 'Propiedad y etiqueta de unidad son requeridos' }, { status: 400 })
        }

        const unit = await prisma.unit.create({
            data: { orgId: session.orgId, propertyId, unitLabel, notes },
            include: { property: true },
        })

        return NextResponse.json(unit, { status: 201 })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

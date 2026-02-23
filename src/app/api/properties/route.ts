import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const properties = await prisma.property.findMany({
        where: { orgId: session.orgId },
        include: { _count: { select: { units: true } } },
        orderBy: { name: 'asc' },
    })

    return NextResponse.json(properties)
}

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { name, address, city, notes } = await req.json()
    if (!name || !address || !city) {
        return NextResponse.json({ error: 'Nombre, dirección y ciudad son requeridos' }, { status: 400 })
    }

    const property = await prisma.property.create({
        data: { orgId: session.orgId, name, address, city, notes },
        include: { _count: { select: { units: true } } },
    })

    return NextResponse.json(property, { status: 201 })
}

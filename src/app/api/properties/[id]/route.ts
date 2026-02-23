import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const { id } = await params
        const { name, address, city, notes } = await req.json()
        const property = await prisma.property.update({
            where: { id, orgId: session.orgId },
            data: { name, address, city, notes },
            include: { _count: { select: { units: true } } },
        })
        return NextResponse.json(property)
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const { id } = await params
        await prisma.property.delete({ where: { id, orgId: session.orgId } })
        return NextResponse.json({ ok: true })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

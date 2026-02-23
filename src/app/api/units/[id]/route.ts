import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const { id } = await params
        const { unitLabel, notes } = await req.json()
        const unit = await prisma.unit.update({
            where: { id, orgId: session.orgId },
            data: { unitLabel, notes },
            include: { property: true },
        })
        return NextResponse.json(unit)
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
        await prisma.unit.delete({ where: { id, orgId: session.orgId } })
        return NextResponse.json({ ok: true })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

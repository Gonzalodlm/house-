import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const { searchParams } = new URL(req.url)
        const propertyId = searchParams.get('propertyId')
        const expenses = await prisma.expense.findMany({
            where: { orgId: session.orgId, ...(propertyId ? { propertyId } : {}) },
            include: { property: true },
            orderBy: { date: 'desc' },
        })
        return NextResponse.json(expenses)
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        const { propertyId, date, category, description, amountUYU, vendor } = await req.json()
        if (!propertyId || !date || !category || !amountUYU) {
            return NextResponse.json({ error: 'Propiedad, fecha, categoría y monto son requeridos' }, { status: 400 })
        }
        const expense = await prisma.expense.create({
            data: {
                orgId: session.orgId,
                propertyId,
                date: new Date(date),
                category,
                description,
                amountUYU: parseFloat(String(amountUYU)),
                vendor,
            },
            include: { property: true },
        })
        return NextResponse.json(expense, { status: 201 })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

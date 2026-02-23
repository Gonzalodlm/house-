import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const now = new Date()
        const in90days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
        const in60days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
        const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        const [propertiesCount, tenantsCount, activeLeases, expiringLeases] = await Promise.all([
            prisma.property.count({ where: { orgId: session.orgId } }),
            prisma.tenant.count({ where: { orgId: session.orgId } }),
            prisma.lease.findMany({
                where: { orgId: session.orgId, status: 'ACTIVE' },
                select: { rentAmount: true },
            }),
            prisma.lease.findMany({
                where: {
                    orgId: session.orgId,
                    status: 'ACTIVE',
                    endDate: { lte: in90days, gte: now },
                },
                select: { endDate: true },
            }),
        ])

        const totalRentUYU = activeLeases.reduce((sum, l) => sum + l.rentAmount, 0)
        const expiring30 = expiringLeases.filter(l => l.endDate <= in30days).length
        const expiring60 = expiringLeases.filter(l => l.endDate > in30days && l.endDate <= in60days).length
        const expiring90 = expiringLeases.filter(l => l.endDate > in60days && l.endDate <= in90days).length

        return NextResponse.json({
            propertiesCount,
            tenantsCount,
            activeLeasesCount: activeLeases.length,
            totalRentUYU,
            expiring30,
            expiring60,
            expiring90,
        })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

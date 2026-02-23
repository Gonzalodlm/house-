import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateMonthlyCharges } from '@/lib/accounting'

// Allow Vercel Cron or manual overrides with a secure token
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization')

        // In production, secure this endpoint using CRON_SECRET from Vercel ENV
        if (
            process.env.NODE_ENV === 'production' &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const today = new Date()
        const currentYearMonth = {
            year: today.getFullYear(),
            // JavaScript months are 0-indexed, but our logic generates human-readable keys
            month: today.getMonth() + 1
        }
        const periodYYYYMM = `${currentYearMonth.year}${String(currentYearMonth.month).padStart(2, '0')}`

        // Fetch active leases and existing charges for the period
        const leases = await prisma.lease.findMany({
            where: { status: 'ACTIVE' }
        })

        const existingCharges = await prisma.charge.findMany({
            where: {
                periodYYYYMM,
                type: 'RENT'
            }
        })

        // Use specific business logic lib
        // @ts-ignore Since our local testing mocked some types previously on accounting.ts
        const newCharges = generateMonthlyCharges(leases, existingCharges, periodYYYYMM, currentYearMonth)

        // Execute changes safely
        if (newCharges.length > 0) {
            await prisma.charge.createMany({
                // @ts-ignore
                data: newCharges
            })
        }

        return NextResponse.json({
            success: true,
            period: periodYYYYMM,
            chargesGenerated: newCharges.length
        })

    } catch (error: any) {
        console.error('Failed to generate charges', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

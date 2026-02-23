import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
        }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
        }

        const response = NextResponse.json({ ok: true })
        response.cookies.set('ph_session', `${user.orgId}|${user.id}`, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        })
        return response
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}

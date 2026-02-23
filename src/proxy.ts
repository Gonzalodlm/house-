import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/api/properties', '/api/units', '/api/tenants', '/api/leases', '/api/dashboard']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))

    if (isProtected) {
        const session = request.cookies.get('ph_session')
        if (!session) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/properties/:path*', '/api/units/:path*', '/api/tenants/:path*', '/api/leases/:path*', '/api/dashboard/:path*'],
}

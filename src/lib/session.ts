import { cookies } from 'next/headers'

export interface Session {
    orgId: string
    userId: string
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies()
    const value = cookieStore.get('ph_session')?.value
    if (!value) return null
    const parts = value.split('|')
    if (parts.length !== 2) return null
    return { orgId: parts[0], userId: parts[1] }
}

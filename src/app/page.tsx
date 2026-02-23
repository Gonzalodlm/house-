import { redirect } from 'next/navigation'

export default function Home() {
    // Simple check for MVP: Redirect to login or dashboard
    // We'll place actual logic inside middleware or client-components
    redirect('/login')
}

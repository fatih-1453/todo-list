import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "", // Relative path for proxy
    fetchOptions: {
        headers: {
            'Bypass-Tunnel-Reminder': 'true',
            'ngrok-skip-browser-warning': 'true',
        }
    },
    plugins: [
        organizationClient()
    ]
})

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession
} = authClient

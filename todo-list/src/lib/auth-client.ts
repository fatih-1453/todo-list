import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: "/api/auth", // Use relative path to leverage Next.js proxy
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

export const API_BASE_URL = "/api"

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession
} = authClient

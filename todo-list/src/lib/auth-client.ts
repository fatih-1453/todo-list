import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: typeof window === "undefined"
        ? (process.env.BETTER_AUTH_URL || "http://localhost:3000")
        : window.location.origin + "/api/auth", // Absolute URL for client (Proxy)
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

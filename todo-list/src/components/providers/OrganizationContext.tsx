"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useSession } from "@/lib/auth-client"

export interface Organization {
    id: string
    name: string
    ownerId: string
    status: 'active' | 'inactive'
    role?: string  // User's role in this org
    createdAt: string
    updatedAt: string
}

interface OrganizationContextType {
    organizations: Organization[]
    activeOrg: Organization | null
    activeOrgId: string | null
    setActiveOrgId: (id: string) => void
    isLoading: boolean
}

const OrganizationContext = React.createContext<OrganizationContextType | undefined>(undefined)

const ACTIVE_ORG_KEY = 'activeOrgId'

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const [activeOrgId, setActiveOrgIdState] = React.useState<string | null>(null)

    const { data: session } = useSession()

    // Fetch user's organizations
    const { data: organizations = [], isLoading } = useQuery({
        queryKey: ['my-organizations'],
        queryFn: () => apiClient.get<Organization[]>('/organizations'),
        enabled: !!session?.user, // Only fetch if user is logged in
    })

    // Load from localStorage on mount
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(ACTIVE_ORG_KEY)
            if (stored) {
                setActiveOrgIdState(stored)
            }
        }
    }, [])

    // Auto-select first org if none selected and orgs are loaded
    React.useEffect(() => {
        if (!activeOrgId && organizations.length > 0) {
            const firstOrgId = organizations[0].id
            setActiveOrgIdState(firstOrgId)
            if (typeof window !== 'undefined') {
                localStorage.setItem(ACTIVE_ORG_KEY, String(firstOrgId))
            }
        }
    }, [organizations, activeOrgId])

    const setActiveOrgId = React.useCallback((id: string) => {
        setActiveOrgIdState(id)
        if (typeof window !== 'undefined') {
            localStorage.setItem(ACTIVE_ORG_KEY, String(id))
        }
        // Invalidate queries that depend on org context
        queryClient.invalidateQueries({ queryKey: ['employees'] })
        queryClient.invalidateQueries({ queryKey: ['departments'] })
        queryClient.invalidateQueries({ queryKey: ['positions'] })
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        queryClient.invalidateQueries({ queryKey: ['team'] })
        queryClient.invalidateQueries({ queryKey: ['reminders'] })
    }, [queryClient])

    const activeOrg = organizations.find(o => o.id === activeOrgId) || null

    return (
        <OrganizationContext.Provider value={{
            organizations,
            activeOrg,
            activeOrgId,
            setActiveOrgId,
            isLoading,
        }}>
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganization() {
    const context = React.useContext(OrganizationContext)
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider')
    }
    return context
}

// Helper to get activeOrgId from localStorage (for api-client)
export function getActiveOrgId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACTIVE_ORG_KEY)
}

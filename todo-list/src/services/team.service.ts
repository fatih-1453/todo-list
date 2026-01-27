import { apiClient } from "@/lib/api-client"

export interface TeamMember {
    id: number
    userId: string | null
    name: string
    email: string | null
    phone: string | null
    role: string | null
    status: "Online" | "Offline" | "Busy" | "In Meeting"
    avatarColor: string | null
    lastActiveAt: string | null
    createdAt: string
}

export interface CreateTeamMemberInput {
    name: string
    email?: string
    phone?: string
    role?: string
    avatarColor?: string
}

export interface UpdateTeamMemberInput extends Partial<CreateTeamMemberInput> { }

export const teamService = {
    getAll: () => apiClient.get<TeamMember[]>("/team"),

    getById: (id: number) => apiClient.get<TeamMember>(`/team/${id}`),

    create: (data: CreateTeamMemberInput) => apiClient.post<TeamMember>("/team", data),

    update: (id: number, data: UpdateTeamMemberInput) =>
        apiClient.put<TeamMember>(`/team/${id}`, data),

    updateStatus: (id: number, status: TeamMember["status"]) =>
        apiClient.patch<TeamMember>(`/team/${id}/status`, { status }),

    delete: (id: number) => apiClient.delete<{ message: string }>(`/team/${id}`),
}


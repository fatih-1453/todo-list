import { apiClient } from "@/lib/api-client"
import { TeamMember } from "./team.service"

export interface Reminder {
    id: number
    userId: string
    title: string | null
    time: string
    date: string
    color: string | null
    isRecurring: boolean
    createdAt: string
    assignees: TeamMember[]
}

export interface CreateReminderInput {
    title?: string
    time: string
    date: string
    color?: string
    isRecurring?: boolean
    assigneeIds?: number[]
}

export interface UpdateReminderInput extends Partial<Omit<CreateReminderInput, 'assigneeIds'>> { }

export const reminderService = {
    getAll: () => apiClient.get<Reminder[]>("/reminders"),

    getToday: () => apiClient.get<Reminder[]>("/reminders/today"),

    getById: (id: number) => apiClient.get<Reminder>(`/reminders/${id}`),

    create: (data: CreateReminderInput) => apiClient.post<Reminder>("/reminders", data),

    update: (id: number, data: UpdateReminderInput) =>
        apiClient.put<Reminder>(`/reminders/${id}`, data),

    delete: (id: number) => apiClient.delete<{ message: string }>(`/reminders/${id}`),
}


import { apiClient } from "@/lib/api-client"

export interface Task {
    id: number
    userId: string
    orgId?: string
    programId?: number // Add programId
    text: string
    done: boolean
    priority: "High" | "Medium" | "Low"
    dueDate: string | null
    startDate?: string | null
    progress?: number
    group?: string
    dependencies?: string[]
    createdAt: string
    updatedAt: string
    tags: Tag[]
    user?: {
        id: string
        name: string | null
        image?: string | null
        employee?: {
            department: string | null
        }
    }
}

export interface Tag {
    id: number
    name: string
    color: string | null
}

export interface CreateTaskInput {
    text: string
    priority?: "High" | "Medium" | "Low"
    dueDate?: string
    tags?: string[]
    programId?: number // Add programId
    group?: string
    status?: string // Use group for status mapping if needed, or handle differently
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
    done?: boolean
}

export const taskService = {
    getAll: (programId?: number) => {
        const query = programId ? `?programId=${programId}` : '';
        return apiClient.get<Task[]>(`/tasks${query}`);
    },

    getById: (id: number) => apiClient.get<Task>(`/tasks/${id}`),

    create: (data: CreateTaskInput) => apiClient.post<Task>("/tasks", data),

    update: (id: number, data: UpdateTaskInput) =>
        apiClient.put<Task>(`/tasks/${id}`, data),

    toggleDone: (id: number) => apiClient.patch<Task>(`/tasks/${id}/toggle`),

    delete: (id: number) => apiClient.delete<{ message: string }>(`/tasks/${id}`),
}


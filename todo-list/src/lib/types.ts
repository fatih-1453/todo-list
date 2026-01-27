// Task Type matching backend schema
export interface Task {
    id: number
    userId: string
    text: string
    done: boolean
    priority: "High" | "Medium" | "Low"
    dueDate: string | null
    createdAt: string
    updatedAt: string
    tags?: { id: number; name: string; color: string | null }[]
    user?: {
        name: string | null
        image: string | null
    }
}

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
    updatedAt: string
}

export interface ChatMessage {
    id: number
    userId: string
    content: string
    role: "user" | "assistant"
    createdAt: string
}

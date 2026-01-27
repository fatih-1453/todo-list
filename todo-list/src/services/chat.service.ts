import { apiClient } from "@/lib/api-client"

export interface ChatConversation {
    id: number
    userId: string
    title: string | null
    isAiAssistant: boolean
    createdAt: string
    updatedAt: string
    messages?: ChatMessage[]
}

export interface ChatMessage {
    id: number
    conversationId: number
    sender: "user" | "assistant" | "member"
    text: string
    type: "text" | "suggestion"
    createdAt: string
}

export interface CreateConversationInput {
    title?: string
    isAiAssistant?: boolean
}

export interface SendMessageInput {
    text: string
    type?: "text" | "suggestion"
}

export const chatService = {
    getConversations: () => apiClient.get<ChatConversation[]>("/chat/conversations"),

    getMessages: (conversationId: number) =>
        apiClient.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`),

    createConversation: (data: CreateConversationInput) =>
        apiClient.post<ChatConversation>("/chat/conversations", data),

    sendMessage: (conversationId: number, data: SendMessageInput) =>
        apiClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, data),

    sendToAi: (text: string) =>
        apiClient.post<{ conversationId: number; message: ChatMessage }>("/chat/ai", { text }),

    deleteConversation: (id: number) =>
        apiClient.delete<{ message: string }>(`/chat/conversations/${id}`),
}


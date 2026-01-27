"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { chatService, CreateConversationInput, SendMessageInput } from "@/services/chat.service"

const CHAT_KEY = ["chat"]

export function useConversations() {
    return useQuery({
        queryKey: [...CHAT_KEY, "conversations"],
        queryFn: chatService.getConversations,
    })
}

export function useMessages(conversationId: number) {
    return useQuery({
        queryKey: [...CHAT_KEY, "conversations", conversationId, "messages"],
        queryFn: () => chatService.getMessages(conversationId),
        enabled: !!conversationId,
    })
}

export function useCreateConversation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateConversationInput) => chatService.createConversation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...CHAT_KEY, "conversations"] })
        },
    })
}

export function useSendMessage(conversationId: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SendMessageInput) => chatService.sendMessage(conversationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...CHAT_KEY, "conversations", conversationId, "messages"]
            })
        },
    })
}

export function useSendToAi() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (text: string) => chatService.sendToAi(text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CHAT_KEY })
        },
    })
}

export function useDeleteConversation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => chatService.deleteConversation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...CHAT_KEY, "conversations"] })
        },
    })
}

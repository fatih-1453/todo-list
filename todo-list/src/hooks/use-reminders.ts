"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reminderService, CreateReminderInput, UpdateReminderInput } from "@/services/reminder.service"

const REMINDERS_KEY = ["reminders"]

export function useReminders() {
    return useQuery({
        queryKey: REMINDERS_KEY,
        queryFn: reminderService.getAll,
    })
}

export function useTodayReminders() {
    return useQuery({
        queryKey: [...REMINDERS_KEY, "today"],
        queryFn: reminderService.getToday,
    })
}

export function useReminder(id: number) {
    return useQuery({
        queryKey: [...REMINDERS_KEY, id],
        queryFn: () => reminderService.getById(id),
        enabled: !!id,
    })
}

export function useCreateReminder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateReminderInput) => reminderService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: REMINDERS_KEY })
        },
    })
}

export function useUpdateReminder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateReminderInput }) =>
            reminderService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: REMINDERS_KEY })
        },
    })
}

export function useDeleteReminder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => reminderService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: REMINDERS_KEY })
        },
    })
}

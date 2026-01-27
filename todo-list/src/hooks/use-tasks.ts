"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { taskService, Task, CreateTaskInput, UpdateTaskInput } from "@/services/task.service"

const TASKS_KEY = ["tasks"]

export function useTasks() {
    return useQuery({
        queryKey: TASKS_KEY,
        queryFn: () => taskService.getAll(),
    })
}

export function useTask(id: number) {
    return useQuery({
        queryKey: [...TASKS_KEY, id],
        queryFn: () => taskService.getById(id),
        enabled: !!id,
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTaskInput) => taskService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_KEY })
        },
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTaskInput }) =>
            taskService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_KEY })
        },
    })
}

// Toggle task done status
export function useToggleTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => taskService.toggleDone(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_KEY })
        },
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => taskService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TASKS_KEY })
        },
    })
}

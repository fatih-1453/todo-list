"use client"

import * as React from "react"
import { X, Calendar as CalendarIcon, Loader2, Check } from "lucide-react" // Rename import
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

interface AddTaskModalProps {
    isOpen: boolean
    onClose: () => void
    initialTitle?: string
    initialDate?: Date | null
}

export function AddTaskModal({ isOpen, onClose, initialTitle = "", initialDate }: AddTaskModalProps) {
    const queryClient = useQueryClient()
    const [text, setText] = React.useState(initialTitle)
    const [dueDate, setDueDate] = React.useState<string>(
        initialDate ? initialDate.toISOString().split('T')[0] : ""
    )
    const [isSuccess, setIsSuccess] = React.useState(false)

    const createTaskMutation = useMutation({
        mutationFn: async (data: { text: string, dueDate?: string }) => {
            return apiClient.post('/tasks', {
                text: data.text,
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            })
        },
        onSuccess: () => {
            setIsSuccess(true)
            toast.success("Task created successfully")
            queryClient.invalidateQueries({ queryKey: ['tasks'] })

            // Close after delay
            setTimeout(() => {
                onClose()
                setText("")
                setDueDate("")
                setIsSuccess(false)
            }, 1000)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim()) return
        createTaskMutation.mutate({ text, dueDate })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            {/* ... existing jsx ... */}
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[var(--bg-main)]">
                    <h2 className="font-bold text-lg">Create Task</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-gray-50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)]"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={!text.trim() || createTaskMutation.isPending || isSuccess}
                            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${isSuccess
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                                }`}
                        >
                            {createTaskMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Created!
                                </>
                            ) : (
                                "Create Task"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

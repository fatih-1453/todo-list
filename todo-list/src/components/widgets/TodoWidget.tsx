"use client"

import * as React from "react"
import { MoreHorizontal, Paperclip, MessageSquare, GripHorizontal, Plus, Loader2, Calendar as CalendarIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTasks, useToggleTask } from "@/hooks/use-tasks"
import Link from "next/link"

export function TodoWidget() {
    const { data: tasks, isLoading, error } = useTasks()
    const toggleTask = useToggleTask()

    const sortedTasks = React.useMemo(() => {
        if (!tasks) return []

        return [...tasks].sort((a, b) => {
            // Helper to check if date is today or overdue
            const isTodayOrOverdue = (dateStr: string | null) => {
                if (!dateStr) return false
                const date = new Date(dateStr)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }

            const aUrgent = isTodayOrOverdue(a.dueDate)
            const bUrgent = isTodayOrOverdue(b.dueDate)

            if (aUrgent && !bUrgent) return -1
            if (!aUrgent && bUrgent) return 1

            // Priority score
            const priorityScore = { High: 3, Medium: 2, Low: 1 }
            const aScore = priorityScore[a.priority as keyof typeof priorityScore] || 0
            const bScore = priorityScore[b.priority as keyof typeof priorityScore] || 0

            return bScore - aScore
        })
    }, [tasks])

    const handleToggle = (id: number) => {
        toggleTask.mutate(id)
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl p-6 relative overflow-hidden group shadow-lg">
            {/* Header Decor (Yellow) */}
            <div className="absolute top-0 left-0 w-full h-32 bg-[var(--accent-yellow)] opacity-10 -z-10 rounded-b-3xl" />

            {/* Top Header */}
            <div className="flex items-start justify-between mb-4 md:mb-6 z-10 relative">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-4">
                        <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-gray-100 flex items-center gap-1">
                            <StarIcon className="w-3 h-3 text-orange-400 fill-orange-400" /> Task
                        </span>
                        <span className="text-gray-400 text-xs px-2">Collaboration</span>
                        <span className="text-gray-400 text-xs px-2">+{tasks?.length || 0}</span>
                    </div>
                    <Link href="/tasks" className="hover:opacity-70 transition-opacity">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                            To do list
                        </h2>
                    </Link>
                </div>
                <Link href="/tasks" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </Link>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 text-sm py-4">
                        Failed to load tasks
                    </div>
                ) : sortedTasks && sortedTasks.length > 0 ? (
                    sortedTasks.slice(0, 6).map(task => {
                        const isOverdue = !task.done && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    "flex items-start gap-3 group/task transition-all rounded-xl p-3",
                                    isOverdue
                                        ? "border border-red-300 bg-red-50 shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                                        : "border border-transparent hover:bg-gray-50/50"
                                )}
                            >
                                <div className="pt-1">
                                    <div
                                        onClick={() => handleToggle(task.id)}
                                        className={cn(
                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer",
                                            task.done ? "bg-black border-black" : "border-gray-300 hover:border-black"
                                        )}>
                                        {task.done && <CheckIcon className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 w-full min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={cn(
                                            "text-sm leading-relaxed transition-colors duration-200 block truncate px-2 py-0.5 rounded-md w-fit",
                                            task.done
                                                ? "text-gray-400 line-through"
                                                : cn(
                                                    "font-medium text-black",
                                                    task.priority === 'High' ? "bg-red-200" :
                                                        task.priority === 'Medium' ? "bg-orange-200" :
                                                            task.priority === 'Low' ? "bg-green-200" :
                                                                "bg-transparent"
                                                )
                                        )}>
                                            {task.text}
                                        </span>
                                        {/* User Avatar */}
                                        {task.user && (
                                            <div className="flex-shrink-0" title={task.user.name || "User"}>
                                                {task.user.image ? (
                                                    <img src={task.user.image} alt={task.user.name || "User"} className="w-5 h-5 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                                                        {task.user.name?.charAt(0) || "U"}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {/* Due Date & Department */}
                                    <div className="mt-1 flex items-center gap-3 text-[10px] text-gray-400">
                                        {task.dueDate && (
                                            <div className={cn("flex items-center gap-1",
                                                !task.done && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
                                                    ? "text-red-500 font-medium"
                                                    : ""
                                            )}>
                                                {/* Show Warning if overdue and not done */}
                                                {!task.done && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) ? (
                                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                                ) : (
                                                    <CalendarIcon className="w-3 h-3" />
                                                )}
                                                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        )}
                                        {task.user?.employee?.department && (
                                            <div className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium truncate max-w-[100px]" title={task.user.employee.department}>
                                                {task.user.employee.department}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center text-gray-400 text-sm py-8">
                        No tasks yet. Add one below!
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-gray-400">
                <div className="flex gap-4">
                    <GripHorizontal className="w-5 h-5 hover:text-black cursor-pointer" />
                    <Paperclip className="w-5 h-5 hover:text-black cursor-pointer" />
                    <MessageSquare className="w-5 h-5 hover:text-black cursor-pointer" />
                </div>
                <Link href="/tasks" className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-black transition-colors">
                    <Plus className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}

function StarIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    )
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function Avatar({ color, text }: { color: string, text: string }) {
    return (
        <div className={cn("w-6 h-6 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white", color)}>
            {text}
        </div>
    )
}


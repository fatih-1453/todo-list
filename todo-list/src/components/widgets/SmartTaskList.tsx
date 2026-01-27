"use client"

import * as React from "react"
import { ArrowDownUp, Check, Filter, Loader2, ListChecks } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useTasks, useToggleTask } from "@/hooks/use-tasks"
import type { Task } from "@/lib/types"

interface SmartTaskListProps {
    searchQuery?: string
}

export function SmartTaskList({ searchQuery = "" }: SmartTaskListProps) {
    const { data: tasks, isLoading, error } = useTasks()
    const toggleTask = useToggleTask()
    const [sortMode, setSortMode] = React.useState<"default" | "priority">("default")

    // First filter by search query
    const filteredTasks = React.useMemo(() => {
        if (!tasks) return []
        if (!searchQuery) return tasks
        const lowerQuery = searchQuery.toLowerCase()
        return tasks.filter(t => t.text.toLowerCase().includes(lowerQuery))
    }, [tasks, searchQuery])

    // Then sort the filtered results
    const sortedTasks = React.useMemo(() => {
        if (sortMode === "priority") {
            return [...filteredTasks].sort((a, b) => {
                const priorityMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 }
                const pA = priorityMap[a.priority] || 0
                const pB = priorityMap[b.priority] || 0
                return pB - pA
            })
        }
        return filteredTasks
    }, [filteredTasks, sortMode])

    const handleSort = () => {
        setSortMode(sortMode === "default" ? "priority" : "default")
    }

    const handleToggle = (id: number, currentStatus: boolean) => {
        toggleTask.mutate(id, {
            onSuccess: () => {
                if (!currentStatus) {
                    toast.success("Task completed! 🎉")
                }
            }
        })
    }

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex items-center justify-center text-red-500">
                Failed to load tasks
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {searchQuery ? "Search Results" : "My Tasks"}
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {sortedTasks.filter((t) => !t.done).length} Open
                    </span>
                </h2>

                <div className="flex gap-2">
                    <button
                        onClick={handleSort}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                            sortMode === "priority"
                                ? "bg-[var(--accent-yellow)] text-black"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        <ArrowDownUp className="w-3 h-3" />
                        Smart Sort
                    </button>
                    <button className="p-2 text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {sortedTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        {searchQuery ? (
                            <>
                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                    <ListChecks className="w-8 h-8 text-gray-300" />
                                </div>
                                <p>No tasks match "{searchQuery}"</p>
                            </>
                        ) : (
                            <p>No tasks yet. Add one above!</p>
                        )}
                    </div>
                ) : (
                    sortedTasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => handleToggle(task.id, task.done)}
                            className={cn(
                                "group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                                task.done
                                    ? "bg-gray-50 border-transparent opacity-60"
                                    : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                    task.done ? "bg-black border-black" : "border-gray-200 group-hover:border-black"
                                )}
                            >
                                {task.done && <Check className="w-3 h-3 text-white" />}
                            </div>

                            <div className="flex-1">
                                <p
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        task.done ? "text-gray-400 line-through" : "text-gray-800"
                                    )}
                                >
                                    {task.text}
                                </p>
                                {task.tags && task.tags.length > 0 && (
                                    <div className="flex gap-2 mt-1.5">
                                        {task.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div
                                className={cn(
                                    "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                                    task.priority === "High"
                                        ? "text-red-500 bg-red-50"
                                        : task.priority === "Medium"
                                            ? "text-orange-500 bg-orange-50"
                                            : "text-green-500 bg-green-50"
                                )}
                            >
                                {task.priority}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}


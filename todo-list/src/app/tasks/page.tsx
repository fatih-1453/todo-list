"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { SmartInput } from "@/components/widgets/SmartInput"
import { SmartTaskList } from "@/components/widgets/SmartTaskList"
import { useCreateTask } from "@/hooks/use-tasks"
import { Suspense } from "react"

function TasksContent() {
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get("search") || ""
    const createTask = useCreateTask()

    const handleAddTask = (text: string, tags: string[]) => {
        // Tags are not fully implemented in backend in this first pass, but priority is
        const priority = tags.includes("High Priority") ? "High" : "Medium"
        createTask.mutate({ text, priority }, {
            onSuccess: () => toast.success("Task created from smart input")
        })
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 scrollbar-none">
            <div className="max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Tasks</h1>
                    {searchQuery ? (
                        <p className="text-gray-500">Searching for: <span className="font-semibold text-black">"{searchQuery}"</span></p>
                    ) : (
                        <p className="text-gray-500">Manage your daily priorities with AI assistance.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Input & Summary */}
                    <div className="md:col-span-1 space-y-6">
                        <SmartInput onAdd={handleAddTask} />

                        {/* Quick Stats Widget (Inline) */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100">
                            <h3 className="font-bold mb-4">Productivity</h3>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-4xl font-bold text-[var(--accent-green)]">--</span>
                                <span className="text-xs text-gray-400 mb-1">Connected to API</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full w-0 bg-[var(--accent-green)] rounded-full" />
                            </div>
                        </div>

                        <div className="bg-[var(--accent-yellow)] p-6 rounded-3xl text-black relative overflow-hidden">
                            <h3 className="font-bold relative z-10">Pro Tip 💡</h3>
                            <p className="text-xs mt-2 opacity-80 relative z-10 leading-relaxed">
                                Use natural language like "Urgent" or "Tomorrow" to let AI auto-tag your tasks.
                            </p>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white opacity-20 rounded-full blur-xl" />
                        </div>
                    </div>

                    {/* Right Column: Task List */}
                    <div className="md:col-span-2 h-[600px]">
                        <SmartTaskList searchQuery={searchQuery} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TasksPage() {
    return (
        <main className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />
                <Suspense fallback={<div className="p-8">Loading tasks...</div>}>
                    <TasksContent />
                </Suspense>
            </div>
        </main>
    )
}


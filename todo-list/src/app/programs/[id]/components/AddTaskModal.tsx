"use client"

import * as React from "react"
import { X, Calendar } from "lucide-react"
import { Task, CreateTaskInput } from "@/services/task.service"
import { cn } from "@/lib/utils"

interface AddTaskModalProps {
    onClose: () => void
    onAdd: (task: CreateTaskInput) => Promise<void>
    departments: string[]
}

export function AddTaskModal({ onClose, onAdd, departments }: AddTaskModalProps) {
    const [title, setTitle] = React.useState("")
    const [assignee, setAssignee] = React.useState(departments[0] || "")
    const [dueDate, setDueDate] = React.useState("")
    const [priority, setPriority] = React.useState<"High" | "Medium" | "Low">("Medium")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        try {
            setIsSubmitting(true)
            await onAdd({
                text: title,
                tags: [assignee], // Using tags for assignee/department for now
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                priority,
                group: 'Pending'
            })
            onClose()
        } catch (error) {
            console.error("Failed to add task", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Add New Task</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                value={assignee}
                                onChange={e => setAssignee(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-white"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as any)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-white"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                            />
                            <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || isSubmitting}
                        className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    )
}

"use client"

import * as React from "react"
import { Task } from "@/services/task.service"
import { Clock, MoreHorizontal, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface TaskCardProps {
    task: Task
    deptColors: Record<string, string>
    onDragStart: (e: React.DragEvent, taskId: number) => void
}

export function TaskCard({ task, deptColors, onDragStart }: TaskCardProps) {
    // Determine department/assignee color based on tags or simple heuristic
    // For now using the first tag or default
    const assignee = task.tags?.[0]?.name || 'General'
    const colorClass = deptColors[assignee] || "bg-gray-100 text-gray-700 border-gray-200"

    return (
        <div
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-move group relative active:shadow-lg active:scale-[0.98]"
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
        >
            {/* Dependency Indicator - Simplified for now */}
            {task.dependencies && task.dependencies.length > 0 && (
                <div className="absolute -top-2 left-4 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 rounded-full flex items-center gap-1 shadow-sm">
                    Blocked
                </div>
            )}

            <div className="flex justify-between items-start mb-2 mt-1">
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
                    colorClass
                )}>
                    {assignee}
                </span>
                <button className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <h4 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2">{task.text}</h4>

            <div className="flex items-center justify-between text-xs text-gray-500">
                {task.dueDate && (
                    <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                )}

                {task.user && (
                    <div className="flex items-center gap-1 ml-auto" title={task.user.name || 'Unknown'}>
                        {task.user.image ? (
                            <img src={task.user.image} className="w-5 h-5 rounded-full" alt="" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center border border-white shadow-sm font-bold text-[10px] text-gray-600">
                                {task.user.name?.[0] || '?'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

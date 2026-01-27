"use client"

import { Program } from "@/services/programService"
import { Layout, CheckCircle2, Clock, PlayCircle } from "lucide-react"

interface DashboardStatsProps {
    programs: Program[]
}

export function DashboardStats({ programs }: DashboardStatsProps) {
    const total = programs.length
    const active = programs.filter(p => p.status === 'Active').length
    const completed = programs.filter(p => p.status === 'Completed').length
    const planning = programs.filter(p => p.status === 'Planning').length

    const stats = [
        {
            label: "Total Projects",
            value: total,
            icon: Layout,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "In Progress",
            value: active,
            icon: PlayCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Planning",
            value: planning,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-purple-600",
            bg: "bg-purple-50"
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
                    </div>
                </div>
            ))}
        </div>
    )
}

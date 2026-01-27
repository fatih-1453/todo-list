"use client"

import { MoreHorizontal, ChevronDown, Loader2 } from "lucide-react"
import { useWeeklyReport } from "@/hooks/use-dashboard"

import Link from "next/link"

const COLORS = ["bg-blue-500", "bg-green-500", "bg-orange-400", "bg-red-500"]
const HEIGHTS = ["h-16", "h-24", "h-32", "h-12", "h-20", "h-28", "h-10"]

export function ReportWidget() {
    const { data: weeklyStats, isLoading, error } = useWeeklyReport()

    const getHeight = (count: number) => {
        if (count <= 2) return "h-12"
        if (count <= 4) return "h-16"
        if (count <= 6) return "h-24"
        if (count <= 8) return "h-28"
        return "h-32"
    }

    const getColor = (done: number, ongoing: number) => {
        if (ongoing > done) return "bg-blue-500"
        if (done > ongoing * 2) return "bg-green-500"
        if (ongoing > 0) return "bg-orange-400"
        return "bg-green-500"
    }

    return (
        <div className="h-full bg-white rounded-3xl p-6 flex flex-col shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <Link href="/tasks" className="block hover:opacity-70 transition-opacity">
                    <h3 className="font-bold text-lg mb-1">Detailed Report</h3>
                    <p className="text-xs text-gray-300">Real-Time Notifications</p>
                </Link>
                <div className="flex items-center gap-1 text-xs font-medium bg-gray-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    Daily <ChevronDown className="w-3 h-3" />
                </div>
            </div>

            {/* <div className="flex gap-2 mb-8">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] border border-white">ER</div>
                <div className="w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center text-[10px] border border-white">AD</div>
                <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] border border-white">6+</div>
            </div> */}

            <div className="flex gap-4 text-xs font-medium text-gray-500 mb-6">
                <span className="text-black">Task</span>
                <span>Collaboration</span>
                <span>Meeting</span>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex items-end justify-between px-2 gap-4">
                {isLoading ? (
                    <div className="flex items-center justify-center w-full h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 text-sm w-full py-4">Failed to load</div>
                ) : weeklyStats && weeklyStats.length > 0 ? (
                    weeklyStats.slice(0, 4).map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                            <div className="relative w-full flex justify-center">
                                {/* Bar */}
                                <div className={`w-8 rounded-xl opacity-90 group-hover:opacity-100 transition-all duration-300 ${getColor(stat.done, stat.ongoing)} ${getHeight(stat.count)} relative`}>
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {stat.count} Tasks
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-xs font-bold mb-0.5">{stat.day}</div>
                                <div className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{stat.done} Done</div>
                                <div className="flex items-center gap-1 mt-1 justify-center">
                                    <span className={`w-1.5 h-1.5 rounded-full ${stat.ongoing > stat.done ? "bg-red-500" : "bg-green-500"}`} />
                                    <span className="text-[9px] text-gray-300">{stat.ongoing > stat.done ? "High" : "Low"}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 text-sm w-full py-8">No report data</div>
                )}
            </div>
        </div>
    )
}


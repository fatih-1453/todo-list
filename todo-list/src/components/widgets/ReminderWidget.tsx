"use client"

import { MoreHorizontal, RefreshCcw, Loader2 } from "lucide-react"
import { useTodayReminders } from "@/hooks/use-reminders"

import Link from "next/link"

const COLORS = ["bg-yellow-400", "bg-purple-500", "bg-orange-400", "bg-green-500", "bg-blue-500", "bg-pink-500"]

export function ReminderWidget() {
    const { data: reminders, isLoading, error } = useTodayReminders()
    const today = new Date()
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" })
    const monthName = today.toLocaleDateString("en-US", { month: "short" })
    const dayNumber = today.getDate()

    return (
        <div className="h-full bg-white rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <Link href="/alerts" className="hover:text-gray-600 transition-colors">
                    <h3 className="text-gray-400 font-medium cursor-pointer">Reminder, {today.getFullYear()}</h3>
                </Link>
                <Link href="/alerts" className="text-gray-300 hover:text-black transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </Link>
            </div>

            <div className="mb-4">
                <span className="text-sm font-bold">Activities</span>
                <span className="ml-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full">{reminders?.length || 0}</span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 text-xs py-2">Failed to load</div>
                ) : reminders && reminders.length > 0 ? (
                    reminders.slice(0, 4).map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${COLORS[index % COLORS.length]}`} />
                                <div className="flex -space-x-1">
                                    <div className={`w-6 h-6 rounded-full ${COLORS[index % COLORS.length]} text-white text-[9px] flex items-center justify-center border border-white`}>ER</div>
                                    <div className={`w-6 h-6 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center border border-white`}>AD</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <RefreshCcw className="w-3 h-3" />
                                {item.time || "08:00"}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 text-xs py-4">No reminders today</div>
                )}
            </div>

            {/* Bottom Date */}
            <div className="mt-auto text-center pt-6 border-t border-gray-50">
                <div className="text-xs font-semibold text-gray-500 mb-1">{dayName}, {monthName}</div>
                <div className="text-6xl font-normal text-black font-sans leading-none tracking-tighter">{dayNumber}</div>
            </div>
        </div>
    )
}


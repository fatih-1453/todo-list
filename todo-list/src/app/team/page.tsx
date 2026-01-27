"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { MemberGrid } from "@/components/widgets/MemberGrid"
import { Sparkles, CalendarCheck } from "lucide-react"

export default function TeamPage() {
    const [scheduleTip, setScheduleTip] = React.useState<string | null>(null)

    const handleSmartSchedule = () => {
        setScheduleTip("Finding best time...")
        setTimeout(() => {
            setScheduleTip("✨ Smart Match: Tuesday at 10:00 AM is available for everyone!")
        }, 1500)
    }

    return (
        <main className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 scrollbar-none">
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Team Collaboration</h1>
                                <p className="text-gray-500">Manage your team members and coordinate schedules.</p>
                            </div>

                            <button
                                onClick={handleSmartSchedule}
                                className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                <Sparkles className="w-4 h-4 text-[var(--accent-yellow)]" />
                                <span>Find Common Meeting Time</span>
                            </button>
                        </div>

                        {/* Smart Result Notification */}
                        {scheduleTip && (
                            <div className="mb-8 p-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-lg">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <CalendarCheck className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium">{scheduleTip}</span>
                            </div>
                        )}

                        <MemberGrid />
                    </div>
                </div>
            </div>
        </main>
    )
}

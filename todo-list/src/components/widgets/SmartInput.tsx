"use client"

import * as React from "react"
import { Send, Sparkles, Clock, Calendar } from "lucide-react"

export function SmartInput({ onAdd }: { onAdd: (text: string, tags: string[]) => void }) {
    const [input, setInput] = React.useState("")
    const [isProcessing, setIsProcessing] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        setIsProcessing(true)

        // Simulate AI processing time
        setTimeout(() => {
            // Simple "smart" extraction (mock)
            const tags = []
            if (input.toLowerCase().includes("urgent") || input.includes("!")) tags.push("High Priority")
            if (input.toLowerCase().includes("tomorrow") || input.toLowerCase().includes("today")) tags.push("Scheduled")
            if (input.toLowerCase().includes("team") || input.toLowerCase().includes("meet")) tags.push("Collaboration")

            onAdd(input, tags)
            setInput("")
            setIsProcessing(false)
        }, 600)
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
            {/* AI Decor */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-200 to-transparent opacity-20 blur-xl" />

            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />
                    <span className="text-xs font-medium text-[var(--accent-orange)]">Smart Input</span>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ex: Review contract with Budi tomorrow at 5pm urgent..."
                        className="w-full bg-gray-50 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-3 h-3" />
                        )}
                    </button>
                </div>

                {/* Smart Hints */}
                {input.length > 5 && (
                    <div className="flex gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        {input.toLowerCase().includes("tomorrow") && (
                            <span className="text-[10px] flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-md">
                                <Calendar className="w-3 h-3" /> Scheduled for Tomorrow
                            </span>
                        )}
                        {input.toLowerCase().includes("5pm") && (
                            <span className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                                <Clock className="w-3 h-3" /> Time: 17:00
                            </span>
                        )}
                    </div>
                )}
            </form>
        </div>
    )
}

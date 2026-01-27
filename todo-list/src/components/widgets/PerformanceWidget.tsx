"use client"

import { MoreHorizontal, Info, Loader2 } from "lucide-react"
import { usePerformance } from "@/hooks/use-dashboard"

import Link from "next/link"

export function PerformanceWidget() {
    const { data: performance, isLoading, error } = usePerformance()

    return (
        <div className="h-full bg-white rounded-3xl p-6 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start">
                <Link href="/tasks" className="hover:opacity-70 transition-opacity">
                    <h3 className="font-bold text-lg">Performances</h3>
                    <p className="text-xs text-gray-300 w-2/3 mt-1 leading-relaxed">Tomorrow's Project Efficiency</p>
                </Link>
                <Link href="/tasks" className="text-gray-300 hover:text-black transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : error ? (
                    <span className="text-red-500 text-sm">Failed to load</span>
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-normal tracking-tight">{performance?.hoursSaved ?? "--"}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
                Estimated hours saved
                <Info className="w-3 h-3 text-gray-300" />
            </div>
        </div>
    )
}


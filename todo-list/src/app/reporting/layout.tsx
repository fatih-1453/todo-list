"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"

export default function ReportingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50/50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-y-auto max-w-[1600px] w-full mx-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

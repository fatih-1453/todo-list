"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"

export default function FavoritesPage() {
    return (
        <main className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />
            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Favorites</h1>
                        <p className="text-gray-500">Favorites functionality coming soon.</p>
                    </div>
                </div>
            </div>
        </main>
    )
}

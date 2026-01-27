import React from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function CanvassingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden selection:bg-yellow-200 selection:text-black">
            {/* Sidebar - Fixed */}
            <Sidebar className="flex-shrink-0" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-none">
                    {children}
                </div>
            </div>
        </div>
    );
}

"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { ChatSidebar } from "@/components/widgets/ChatSidebar"
import { ChatWindow } from "@/components/widgets/ChatWindow"
import * as React from "react"

export default function ChatPage() {
    const [selectedConversationId, setSelectedConversationId] = React.useState<number | null>(null)

    return (
        <main className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />

                <div className="flex-1 overflow-hidden p-4 md:p-8 pt-2">
                    <div className="bg-white rounded-3xl h-full shadow-sm border border-gray-100 flex overflow-hidden max-w-7xl mx-auto">
                        {/* Chat Sidebar */}
                        <div className={`
                            h-full bg-white border-r border-gray-100 flex-shrink-0 transition-all duration-300
                            ${selectedConversationId ? 'hidden md:block' : 'w-full md:w-auto block'}
                        `}>
                            <ChatSidebar
                                selectedId={selectedConversationId}
                                onSelect={setSelectedConversationId}
                            />
                        </div>

                        {/* Main Chat Area */}
                        <div className={`
                            flex-1 h-full overflow-hidden bg-[#efeae2] relative
                            ${selectedConversationId ? 'block' : 'hidden md:block'}
                        `}>
                            <ChatWindow
                                conversationId={selectedConversationId}
                                onBack={() => setSelectedConversationId(null)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

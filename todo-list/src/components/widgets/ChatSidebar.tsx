"use client"

import * as React from "react"
import { Search, Plus, User } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { NewChatModal } from "./NewChatModal"

interface ChatSidebarProps {
    selectedId: number | null
    onSelect: (id: number) => void
}

export function ChatSidebar({ selectedId, onSelect }: ChatSidebarProps) {
    const { data: session } = authClient.useSession()
    const queryClient = useQueryClient()
    const [isNewChatOpen, setIsNewChatOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    // 1. Fetch Current User to get Group ID
    const { data: currentUser } = useQuery({
        queryKey: ['user', session?.user?.id],
        queryFn: async () => {
            const users = await apiClient.get<any[]>('/users')
            return users.find(u => u.id === session?.user?.id)
        },
        enabled: !!session?.user?.id
    })

    // 3. Fetch Conversations (for unread counts and latest msg)
    const { data: conversations, isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => apiClient.get<any[]>('/chat/conversations'),
        refetchInterval: 5000 // Poll for new messages every 5s
    })

    // 4. Create Conversation Mutation
    const createConversationMutation = useMutation({
        mutationFn: async (userId: string) => {
            return apiClient.post<any>('/chat/conversations', {
                type: 'p2p',
                participantId: userId
            })
        },
        onSuccess: (data) => {
            onSelect(data.id)
            setIsNewChatOpen(false) // Close modal
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }
    })

    const handleNewChat = (userId: string) => {
        createConversationMutation.mutate(userId)
    }

    const filteredConversations = React.useMemo(() => {
        if (!conversations) return []

        let filtered = conversations.filter(c => {
            // Basic search on Title or Participant Names
            // Note: Conversation object usually has 'title' or 'participants'
            // If P2P, title might be "Chat with X", "Private Chat", or null.
            // We need to resolve the display name dynamically.
            return true // Implement search later properly or rely on display name logic
        })

        // Filter by UI search
        if (search) {
            filtered = filtered.filter(c => {
                const otherParticipant = c.participants?.find((p: any) => p.user.id !== currentUser?.id)?.user;
                const name = c.title || otherParticipant?.name || "Unknown";
                return name.toLowerCase().includes(search.toLowerCase());
            })
        }

        return filtered;
    }, [conversations, search, currentUser])

    return (
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-white h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[var(--bg-main)]">
                <div className="flex items-center gap-2">
                    {currentUser?.image ? (
                        <img src={currentUser.image} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                    )}
                    <h2 className="font-bold text-lg">Chats</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsNewChatOpen(true)}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                        title="New Chat"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search or start new chat"
                        className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center text-gray-400 text-sm py-4">Loading chats...</div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8 px-6">
                        No messages yet. <br />
                        Click <span className="font-bold">+</span> to start a new chat.
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const otherParticipant = conv.participants?.find((p: any) => p.user.id !== currentUser?.id)?.user;

                        // Logic: For P2P, show Other User Name. For Group, show Title.
                        // If Title is "Direct Message" (legacy default), treat as P2P naming.
                        const name = (conv.type === 'p2p' || conv.title === 'Direct Message')
                            ? (otherParticipant?.name || "Unknown User")
                            : (conv.title || otherParticipant?.name || "Unknown");

                        const image = otherParticipant?.image;
                        const isSelected = selectedId === conv.id;

                        // Time formatting
                        let timeDisplay = "";
                        if (conv.latestMessage?.createdAt) {
                            const date = new Date(conv.latestMessage.createdAt);
                            const now = new Date();
                            // If today, show time. Else date.
                            if (date.toDateString() === now.toDateString()) {
                                timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            } else {
                                timeDisplay = date.toLocaleDateString();
                            }
                        }

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={`group flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${isSelected ? "bg-gray-100" : "bg-white"}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                    {image ? (
                                        <img src={image} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                                        <span className={`text-xs whitespace-nowrap ${conv.unreadCount > 0 ? "text-orange-600 font-bold" : "text-gray-400"}`}>
                                            {timeDisplay}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <p className="text-sm text-gray-500 truncate pr-2">
                                            {conv.latestMessage ? conv.latestMessage.text : <span className="italic">No messages</span>}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-orange-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-sm">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <NewChatModal
                isOpen={isNewChatOpen}
                onClose={() => setIsNewChatOpen(false)}
                onSelectUser={handleNewChat}
            />
        </div>
    )
}

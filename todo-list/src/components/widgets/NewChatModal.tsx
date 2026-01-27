"use client"

import * as React from "react"
import { Search, X, User } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"

interface NewChatModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectUser: (userId: string) => void
}

export function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
    const { data: session } = authClient.useSession()
    const [search, setSearch] = React.useState("")

    // Fetch all registered users from database
    const { data: allUsers, isLoading } = useQuery({
        queryKey: ['all-users-for-chat'],
        queryFn: () => apiClient.get<any[]>('/users'),
        enabled: !!session?.user?.id
    })

    // Filter out current user and apply search
    const filteredContacts = allUsers?.filter(c =>
        c.id !== session?.user?.id &&
        c.name?.toLowerCase().includes(search.toLowerCase())
    ) || []

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[var(--bg-main)]">
                    <h2 className="font-bold text-lg">New Chat</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Data search..."
                            className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)]"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="text-center text-gray-400 py-8">Loading contacts...</div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">No contacts found</div>
                    ) : (
                        <div className="space-y-1">
                            {filteredContacts.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => onSelectUser(contact.id)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                        {contact.image ? (
                                            <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-black">{contact.name}</h3>
                                        <p className="text-sm text-gray-500 truncate">{contact.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

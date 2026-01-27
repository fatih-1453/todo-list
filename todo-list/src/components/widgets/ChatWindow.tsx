"use client"

import * as React from "react"
import { Send, Mic, Paperclip, Bot, Sparkles, User as UserIcon, Plus, Search, MoreVertical, Calendar, ArrowLeft } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { useSmartDetection } from "@/hooks/useSmartDetection"
import { AddTaskModal } from "./AddTaskModal"

interface ChatWindowProps {
    conversationId: number | null
    onBack?: () => void
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
    const { data: session } = authClient.useSession()
    const queryClient = useQueryClient()
    const [input, setInput] = React.useState("")
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const { analyzeMessage } = useSmartDetection()

    // Smart Task Modal State
    const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false)
    const [smartTaskData, setSmartTaskData] = React.useState<{ title: string, date: Date | null }>({ title: "", date: null })

    // Fetch Current User (consistent with Sidebar)
    const { data: currentUser } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: () => apiClient.get<any>('/users/me').catch(() => null),
        enabled: !!session?.user?.id
    })

    // Fetch Messages
    const { data: messages, isLoading } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () => apiClient.get<any[]>(`/chat/conversations/${conversationId}/messages`),
        enabled: !!conversationId,
        refetchInterval: 3000, // Poll every 3s
        retry: false
    })

    // Auto-scroll to bottom
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Mark as Read
    React.useEffect(() => {
        if (conversationId && messages && messages.length > 0) {
            apiClient.post(`/chat/conversations/${conversationId}/read`).catch(console.error);
            // Invalidate conversations to update badge in sidebar
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    }, [conversationId, messages, queryClient]);

    // Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (text: string) => {
            return apiClient.post('/chat/conversations/' + conversationId + '/messages', {
                text,
                type: 'text'
            })
        },
        onSuccess: () => {
            setInput("")
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
            // Also update conversations list to show new latest message
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }
    })

    const { data: conversation, isLoading: isLoadingConversation, isError: isConversationError } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: () => apiClient.get<any>(`/chat/conversations/${conversationId}`),
        enabled: !!conversationId,
        retry: false // Don't retry if 404
    });

    React.useEffect(() => {
        if (isConversationError && onBack) {
            onBack(); // Reset selection if conversation not found
        }
    }, [isConversationError, onBack]);

    const otherParticipant = React.useMemo(() => {
        if (!conversation) return null;
        const myId = currentUser?.id || session?.user?.id;
        if (!myId) return null;

        return conversation.participants?.find((p: any) => p.user.id !== myId)?.user;
    }, [conversation, currentUser, session]);

    const chatTitle = React.useMemo(() => {
        if (!conversation) return "Chat";
        // If we found another participant, prefer their name for P2P-like look
        if (otherParticipant?.name) {
            if (conversation.type === 'p2p' || conversation.title === 'Direct Message' || !conversation.title) {
                return otherParticipant.name;
            }
        }
        return conversation.title || "Chat";
    }, [conversation, otherParticipant]);

    const otherParticipantLastReadAt = React.useMemo(() => {
        if (!conversation?.participants) return 0;
        const myId = currentUser?.id || session?.user?.id;
        const other = conversation.participants.find((p: any) => p.user.id !== myId);
        return other?.lastReadAt ? new Date(other.lastReadAt).getTime() : 0;
    }, [conversation, currentUser, session]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !conversationId) return
        sendMessageMutation.mutate(input)
    }

    if (!conversationId) {
        return (
            <div className="flex-1 flex flex-col h-full bg-white rounded-r-3xl items-center justify-center text-gray-400 p-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Welcome to Chat</h3>
                <p className="text-sm mt-2">Select a conversation from the sidebar to start messaging.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    {/* Back Button (Mobile Only) */}
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {otherParticipant?.image ? (
                            <img src={otherParticipant.image} alt={chatTitle} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        {isLoadingConversation ? (
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        ) : (
                            <h2 className="font-semibold text-gray-900 leading-tight">{otherParticipant?.name || conversation?.title || "Chat"}</h2>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <p className="text-xs text-green-600 font-medium">Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[#00a884]">
                    <Search className="w-5 h-5 cursor-pointer hover:text-[#008f6f]" />
                    <MoreVertical className="w-5 h-5 cursor-pointer hover:text-[#008f6f]" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#e5ded8]"
                style={{
                    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "400px"
                }}
            >
                <div ref={messagesEndRef} />
                {isLoading ? (
                    <div className="text-center text-gray-400">Loading messages...</div>
                ) : messages?.length === 0 ? (
                    <div className="text-center text-gray-300 py-10">No messages yet. Say hi!</div>
                ) : (
                    messages?.map((msg) => {
                        // Inside ChatWindow component...
                        // ... inside map loop ...
                        const detection = analyzeMessage(msg.text);
                        const isMe = msg.senderId === session?.user?.id || (msg.sender === 'user' && !msg.senderId && true);

                        // ... inside map ...
                        const isRead = new Date(msg.createdAt).getTime() <= otherParticipantLastReadAt;

                        return (
                            <div key={msg.id} className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] md:max-w-[60%] rounded-lg px-3 py-1.5 shadow-sm relative text-sm group ${isMe
                                    ? "bg-[#dcf8c6] text-black rounded-tr-none"
                                    : "bg-white text-black rounded-tl-none"
                                    }`}>
                                    <div className="flex flex-col">
                                        <span className="leading-relaxed whitespace-pre-wrap">{msg.text}</span>
                                        <div className="flex items-center justify-end gap-1 mt-0.5 select-none">

                                            {/* Smart Action Button */}
                                            {detection.isActionable && !isMe && (
                                                <button
                                                    onClick={() => {
                                                        setSmartTaskData({
                                                            title: detection.suggestedTitle,
                                                            date: detection.suggestedDate
                                                        });
                                                        setIsAddTaskOpen(true);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity mr-auto flex items-center gap-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full hover:bg-blue-200"
                                                    title="Convert to Task"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Create Task</span>
                                                </button>
                                            )}

                                            <span className="text-[10px] text-gray-500">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {/* Ticks for Sent Messages */}
                                            {isMe && (
                                                <span className={isRead ? "text-blue-500" : "text-gray-400"}>
                                                    <svg viewBox="0 0 16 15" width="16" height="15" className="">
                                                        <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-7.46a.366.366 0 0 0-.064-.54zm-4.72 2.7l-.378-.483a.418.418 0 0 0-.542-.036l-1.32 1.266a.32.32 0 0 1-.484-.033L1.294 6.741a.366.366 0 0 0-.51-.063l-.478.372a.365.365 0 0 0-.063.51l6.272 7.46c.143.14.361.125.484-.033l.358-.325a.319.319 0 0 0 .032-.484z" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-100 flex items-center gap-2">
                {/* Add attachment/emoji buttons here later */}
                <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Plus className="w-6 h-6" /> {/* Placeholder for attachment */}
                </button>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!input.trim()) return;
                        sendMessageMutation.mutate(input);
                    }}
                    className="flex-1 flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 py-2 px-4 rounded-full border-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sendMessageMutation.isPending}
                        className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] disabled:opacity-50 transition-colors flex items-center justify-center w-10 h-10"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
            {/* Modal */}
            <AddTaskModal
                isOpen={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                initialTitle={smartTaskData.title}
                initialDate={smartTaskData.date}
            />
        </div>
    )
}

"use client"

import * as React from "react"
import { Send, MoreHorizontal, Plus } from "lucide-react"
import { useConversations, useMessages, useSendToAi } from "@/hooks/use-chat"

export function AIChatWidget() {
    const [inputValue, setInputValue] = React.useState("")
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // 1. Get conversations to find the AI chat
    const { data: conversations, isLoading: isLoadingConversations } = useConversations()

    // Find the AI conversation
    const aiConversation = conversations?.find(c => c.isAiAssistant)
    const conversationId = aiConversation?.id

    // 2. Get messages for the AI conversation
    const { data: messages, isLoading: isLoadingMessages } = useMessages(conversationId!)

    // 3. Mutation to send message
    const { mutate: sendMessage, isPending: isSending } = useSendToAi()

    // Scroll to bottom on new messages
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = () => {
        if (!inputValue.trim() || isSending) return

        sendMessage(inputValue, {
            onSuccess: () => {
                setInputValue("")
            }
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Sort messages by date (oldest first for chat view)
    const sortedMessages = React.useMemo(() => {
        if (!messages) return []
        return [...messages].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    }, [messages])

    return (
        <div className="h-full bg-[#efeae2] rounded-3xl flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs overflow-hidden">
                        AI
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <p className="text-xs text-green-600 font-medium">Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[#00a884]">
                    <MoreHorizontal className="w-5 h-5 cursor-pointer" />
                </div>
            </div>

            {/* Message Area */}
            <div
                ref={scrollRef}
                className="flex-1 space-y-2 overflow-y-auto p-4 custom-scrollbar"
                style={{
                    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "400px",
                    backgroundColor: "#e5ded8"
                }}
            >
                {isLoadingConversations || (conversationId && isLoadingMessages) ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        Loading...
                    </div>
                ) : !conversationId ? (
                    <div className="flex justify-center items-center h-full text-gray-500 text-center px-4 bg-white/50 p-4 rounded-xl mx-4 my-auto backdrop-blur-sm self-center">
                        Start a conversation with the AI Assistant!
                    </div>
                ) : sortedMessages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-500 text-center px-4 bg-white/50 p-4 rounded-xl mx-4 my-auto backdrop-blur-sm self-center">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    sortedMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm relative text-sm group ${msg.sender === 'user'
                                ? "bg-[#dcf8c6] text-black rounded-tr-none"
                                : "bg-white text-black rounded-tl-none"
                                }`}>
                                <div className="flex flex-col">
                                    <span className="leading-relaxed whitespace-pre-wrap">{msg.text}</span>
                                    <div className="flex items-center justify-end gap-1 mt-0.5 select-none text-[10px] text-gray-500">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.sender === 'user' && (
                                            <span className="text-blue-500">
                                                <svg viewBox="0 0 16 15" width="16" height="15" className="">
                                                    <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-7.46a.366.366 0 0 0-.064-.54zm-4.72 2.7l-.378-.483a.418.418 0 0 0-.542-.036l-1.32 1.266a.32.32 0 0 1-.484-.033L1.294 6.741a.366.366 0 0 0-.51-.063l-.478.372a.365.365 0 0 0-.063.51l6.272 7.46c.143.14.361.125.484-.033l.358-.325a.319.319 0 0 0 .032-.484z" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-100 flex items-center gap-2 shrink-0">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Plus className="w-6 h-6" />
                </button>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    disabled={isSending}
                    className="flex-1 py-2 px-4 rounded-full border-none focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
                />

                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] disabled:opacity-50 transition-colors flex items-center justify-center w-10 h-10 shadow-sm"
                >
                    <Send className="w-5 h-5 ml-0.5" />
                </button>
            </div>
        </div>
    )
}

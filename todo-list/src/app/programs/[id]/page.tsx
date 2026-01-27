"use client"

import * as React from "react"
import {
    MessageSquare,
    Paperclip,
    LayoutGrid,
    FileText,
    Send,
    Sparkles,
    Calendar,
    AlertTriangle,
    Clock,
    MoreHorizontal,
    ArrowLeft,
    X,
    Image as ImageIcon,
    File
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/Sidebar"
import { programService, Program, Discussion, IntelligenceReport } from "@/services/programService"
import { fileService } from "@/services/fileService"
import { departmentService, Department } from "@/services/departmentService"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { authClient } from "@/lib/auth-client"
import { ChatAttachments } from "./components/ChatAttachments"
import { PollCard } from "./components/PollCard"
import { EventCard } from "./components/EventCard"
import { taskService, Task, CreateTaskInput } from "@/services/task.service"
import { TaskCard } from "./components/TaskCard"
import { AddTaskModal } from "./components/AddTaskModal"
import { ResourcesView } from "./components/ResourcesView"

// Recursive ReplyItem component for nested replies
interface ReplyItemProps {
    reply: Discussion
    parentUser?: string
    onReply: (discussion: Discussion) => void
    onDelete: (discussionId: number) => void
    currentUserId?: string
    level: number
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, parentUser, onReply, onDelete, currentUserId, level }) => {
    const maxLevel = 4 // Maximum nesting depth
    const marginLeft = level === 1 ? '' : 'ml-8'
    const isOwner = currentUserId === reply.userId

    return (
        <div className={cn("space-y-3", marginLeft)}>
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0 overflow-hidden">
                    {reply.user?.image ? (
                        <img src={reply.user.image} alt={reply.user.name} className="w-full h-full object-cover" />
                    ) : (
                        reply.user?.name?.[0] || '?'
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{reply.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">{format(new Date(reply.createdAt), 'h:mm a')}</span>
                    </div>

                    {/* Media Attachment */}
                    {reply.mediaUrl && (
                        <div className="mt-2 mb-1">
                            {reply.mediaType?.startsWith('image/') ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}${reply.mediaUrl}`}
                                    alt="Attachment"
                                    className="max-w-[200px] max-h-[200px] rounded-lg border border-gray-100 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}${reply.mediaUrl}`, '_blank')}
                                />
                            ) : (
                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}${reply.mediaUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors w-full max-w-xs group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-blue-500">
                                        <File className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {reply.fileName || 'Attached File'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {reply.fileSize || 'Unknown size'}
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>
                    )}

                    <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                        {parentUser && <span className="text-blue-600 font-medium">@{parentUser} </span>}
                        {reply.content}
                    </p>
                    <div className="flex gap-3 mt-1">
                        <button
                            onClick={() => onReply(reply)}
                            className="text-xs text-gray-400 font-medium hover:text-gray-600"
                        >
                            Reply
                        </button>
                        {isOwner && (
                            <button
                                onClick={() => onDelete(reply.id)}
                                className="text-xs text-red-400 font-medium hover:text-red-600"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Nested replies */}
            {reply.replies && reply.replies.length > 0 && level < maxLevel && (
                <div className="space-y-3">
                    {reply.replies.map((nestedReply) => (
                        <ReplyItem
                            key={nestedReply.id}
                            reply={nestedReply}
                            parentUser={reply.user?.name?.split(' ')[0]}
                            onReply={onReply}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function ProgramDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { data: session } = authClient.useSession()
    const currentUserId = session?.user?.id

    const [program, setProgram] = React.useState<Program | null>(null)
    const [allDepartments, setAllDepartments] = React.useState<Department[]>([])
    const [activeTab, setActiveTab] = React.useState<'discussion' | 'tasks' | 'files'>('discussion')
    const [isLoading, setIsLoading] = React.useState(true)
    const [newMessage, setNewMessage] = React.useState("")
    const [deptFilter, setDeptFilter] = React.useState<string | null>(null)
    const [discussions, setDiscussions] = React.useState<Discussion[]>([])
    const [intelligenceReport, setIntelligenceReport] = React.useState<IntelligenceReport | null>(null)
    const [isSending, setIsSending] = React.useState(false)
    const [replyingTo, setReplyingTo] = React.useState<Discussion | null>(null) // Top-level parent
    const [replyToUser, setReplyToUser] = React.useState<string | null>(null) // User being mentioned

    // File Upload State
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)

    const handleFileSelect = (file: File) => {
        setSelectedFile(file)
    }

    const handlePollCreate = async (question: string, options: string[]) => {
        try {
            setIsSending(true)
            const formattedOptions = options.map(opt => ({
                id: crypto.randomUUID(),
                text: opt,
                voterIds: []
            }))

            await programService.createDiscussion(parseInt(id), {
                content: "",
                type: "poll",
                metadata: {
                    question,
                    options: formattedOptions,
                    allowMultiple: false
                }
            })
            // Refetch
            const discussionsData = await programService.getDiscussions(parseInt(id))
            setDiscussions(discussionsData)
        } catch (error) {
            console.error('Failed to create poll:', error)
        } finally {
            setIsSending(false)
        }
    }

    const handleEventCreate = async (title: string, date: string, location: string, description: string) => {
        try {
            setIsSending(true)
            await programService.createDiscussion(parseInt(id), {
                content: "",
                type: "event",
                metadata: {
                    title,
                    date,
                    location,
                    description
                }
            })
            // Refetch
            const discussionsData = await programService.getDiscussions(parseInt(id))
            setDiscussions(discussionsData)
        } catch (error) {
            console.error('Failed to create event:', error)
        } finally {
            setIsSending(false)
        }
    }

    const handleVote = async (discussionId: number, optionIds: string[]) => {
        try {
            // Optimistic update could go here
            await programService.votePoll(parseInt(id), discussionId, optionIds)
            // Refetch
            const discussionsData = await programService.getDiscussions(parseInt(id))
            setDiscussions(discussionsData)
        } catch (error) {
            console.error('Failed to vote:', error)
        }
    }

    // Initial data fetch
    React.useEffect(() => {
        const fetchProgram = async () => {
            if (!id) return
            try {
                setIsLoading(true)
                const [programData, discussionsData, reportData, departmentsData] = await Promise.all([
                    programService.getById(parseInt(id)),
                    programService.getDiscussions(parseInt(id)),
                    programService.getIntelligenceReport(parseInt(id)),
                    departmentService.getAll()
                ])
                setProgram(programData)
                setDiscussions(discussionsData)
                setIntelligenceReport(reportData)
                setAllDepartments(departmentsData)
            } catch (error) {
                console.error('Failed to fetch program:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProgram()
    }, [id])

    // Polling for real-time updates (every 5 seconds when on discussion tab)
    React.useEffect(() => {
        if (activeTab !== 'discussion' || isLoading) return

        const pollDiscussions = async () => {
            try {
                const [discussionsData, reportData] = await Promise.all([
                    programService.getDiscussions(parseInt(id)),
                    programService.getIntelligenceReport(parseInt(id))
                ])
                setDiscussions(discussionsData)
                setIntelligenceReport(reportData)
            } catch (error) {
                console.error('Failed to poll discussions:', error)
            }
        }

        const interval = setInterval(pollDiscussions, 5000)
        return () => clearInterval(interval)
    }, [activeTab, isLoading, id])


    const [tasks, setTasks] = React.useState<Task[]>([])

    const [isTaskLoading, setIsTaskLoading] = React.useState(false)
    const [showAddTaskModal, setShowAddTaskModal] = React.useState(false)

    // ... existing use effects

    // Fetch tasks when tab changes
    React.useEffect(() => {
        if (activeTab === 'tasks' && id) {
            const fetchTasks = async () => {
                setIsTaskLoading(true)
                try {
                    const data = await taskService.getAll(parseInt(id))
                    setTasks(data)
                } catch (error) {
                    console.error("Failed to fetch tasks", error)
                } finally {
                    setIsTaskLoading(false)
                }
            }
            fetchTasks()
        }
    }, [activeTab, id])

    const handleTaskDrop = async (e: React.DragEvent, status: string) => {
        e.preventDefault()
        const taskId = parseInt(e.dataTransfer.getData("taskId"))
        if (!taskId) return

        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === taskId
                ? { ...t, group: status, done: status === 'Done' }
                : t
        )
        setTasks(updatedTasks)

        try {
            await taskService.update(taskId, { group: status, done: status === 'Done' })
        } catch (error) {
            console.error("Failed to update task", error)
            // Revert on error if needed
        }
    }



    const handleAddTask = async (taskInput: CreateTaskInput) => {
        if (!id) return
        try {
            await taskService.create({
                ...taskInput,
                programId: parseInt(id)
            })
            // Refetch tasks
            const data = await taskService.getAll(parseInt(id))
            setTasks(data)
        } catch (error) {
            console.error("Failed to create task", error)
            throw error // Let modal handle error state if needed
        }
    }



    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedFile) return

        try {
            setIsSending(true)

            let mediaData = {}

            // Upload file if selected
            if (selectedFile) {
                setIsUploading(true)
                try {
                    const formData = new FormData()
                    if (selectedFile) formData.append('file', selectedFile)
                    // You might need to change 'folderId' logic if you want to organize chat uploads
                    const fileRecord = await fileService.createFileRecord(formData)

                    mediaData = {
                        mediaUrl: fileRecord.path,
                        mediaType: fileRecord.type,
                        fileName: fileRecord.name,
                        fileSize: fileRecord.size
                    }
                } catch (uploadError) {
                    console.error('Failed to upload file:', uploadError)
                    alert('Failed to upload attachment')
                    setIsSending(false)
                    setIsUploading(false)
                    return
                }
                setIsUploading(false)
            }

            await programService.createDiscussion(parseInt(id), {
                content: newMessage.trim(),
                parentId: replyingTo?.id || null,
                ...mediaData
            })

            // Refetch all discussions to ensure replies are in correct position
            const discussionsData = await programService.getDiscussions(parseInt(id))
            setDiscussions(discussionsData)

            setNewMessage("")
            setNewMessage("")
            setSelectedFile(null)
            setReplyingTo(null)
            setReplyToUser(null)
        } catch (error) {
            console.error('Failed to send message:', error)
        } finally {
            setIsSending(false)
            setIsUploading(false)
        }
    }


    // Handle reply - find the top-level parent if replying to a nested reply
    const handleReply = (discussion: Discussion, parentDiscussion?: Discussion) => {
        const userName = discussion.user?.name?.split(' ')[0] || 'user'

        if (parentDiscussion) {
            // Replying to a reply - use top-level parent, mention the reply author
            setReplyingTo(parentDiscussion)
            setReplyToUser(userName)
        } else {
            // Replying to a top-level comment
            setReplyingTo(discussion)
            setReplyToUser(userName)
        }
    }

    // Handle delete discussion
    const handleDelete = async (discussionId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return

        try {
            await programService.deleteDiscussion(parseInt(id), discussionId)
            // Refetch all discussions
            const discussionsData = await programService.getDiscussions(parseInt(id))
            setDiscussions(discussionsData)
        } catch (error) {
            console.error('Failed to delete discussion:', error)
            alert('Failed to delete comment. You can only delete your own comments.')
        }
    }



    const deptColors: Record<string, string> = {
        "Logistics": "bg-orange-100 text-orange-700 border-orange-200",
        "IT": "bg-blue-100 text-blue-700 border-blue-200",
        "Medical": "bg-red-100 text-red-700 border-red-200",
        "Transport": "bg-emerald-100 text-emerald-700 border-emerald-200",
        "HR": "bg-purple-100 text-purple-700 border-purple-200",
        "Finance": "bg-gray-100 text-gray-700 border-gray-200",
        "Events": "bg-pink-100 text-pink-700 border-pink-200",
        "Creative": "bg-indigo-100 text-indigo-700 border-indigo-200",
        "Engineering": "bg-cyan-100 text-cyan-700 border-cyan-200",
        "Security": "bg-slate-100 text-slate-700 border-slate-200"
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!program) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Program not found</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-20 border-b border-gray-200 bg-white px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{program.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">Departments involved:</span>
                                <div className="flex -space-x-2">
                                    {(program.departments || []).map((dept, i) => (
                                        <div
                                            key={dept}
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white ring-1 ring-gray-100 uppercase",
                                                deptColors[dept] || "bg-gray-100"
                                            )}
                                            title={dept}
                                        >
                                            {dept[0]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                        {[
                            { id: 'discussion', label: 'Discussion', icon: MessageSquare },
                            { id: 'tasks', label: 'Task Map', icon: LayoutGrid },
                            { id: 'files', label: 'Resources', icon: FileText }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                                    activeTab === tab.id
                                        ? "bg-white text-black shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'discussion' && (
                        <div className="h-full flex flex-col">
                            {/* Filter Bar */}
                            <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex gap-2 overflow-x-auto">
                                <button
                                    onClick={() => setDeptFilter(null)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                        !deptFilter ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    All Updates
                                </button>
                                {program.departments.map(dept => (
                                    <button
                                        key={dept}
                                        onClick={() => setDeptFilter(dept === deptFilter ? null : dept)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
                                            deptFilter === dept
                                                ? "ring-2 ring-offset-1 ring-black/5"
                                                : "opacity-70 grayscale hover:grayscale-0 hover:opacity-100",
                                            deptColors[dept]
                                        )}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {dept}
                                    </button>
                                ))}
                            </div>

                            {/* Chat Feed */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Dynamic Intelligence Report */}
                                {isLoading ? (
                                    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ) : intelligenceReport ? (
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4 flex gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600 shrink-0">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm">Daily Intelligence Report</h4>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                    intelligenceReport.collaborationLevel === 'high' ? "bg-green-100 text-green-700" :
                                                        intelligenceReport.collaborationLevel === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-gray-100 text-gray-600"
                                                )}>
                                                    {intelligenceReport.collaborationLevel} Collab
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed mb-2">
                                                {intelligenceReport.summary}
                                            </p>

                                            {/* Recent Activity Highlights */}
                                            {intelligenceReport.recentActivity && intelligenceReport.recentActivity.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {intelligenceReport.recentActivity.map((activity, i) => (
                                                        <span key={i} className="text-[10px] bg-white/60 px-2 py-1 rounded-md text-gray-500 border border-purple-100/50">
                                                            {activity}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}

                                {discussions
                                    .filter(d => !deptFilter || d.user?.employee?.department === deptFilter)
                                    .map(msg => (
                                        <div key={msg.id} className="space-y-3">
                                            {/* Main Message */}
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0 overflow-hidden">
                                                    {msg.user?.image ? (
                                                        <img src={msg.user.image} alt={msg.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        msg.user?.name?.[0] || '?'
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 text-sm">{msg.user?.name || 'Unknown'}</span>
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
                                                            deptColors[msg.user?.employee?.department || ''] || 'bg-gray-100 text-gray-700 border-gray-200'
                                                        )}>
                                                            {msg.user?.employee?.department || 'N/A'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                                                    </div>

                                                    {/* Top Level Media Attachment */}
                                                    {msg.metadata?.options ? (
                                                        <PollCard
                                                            discussion={msg}
                                                            currentUserId={currentUserId || ''}
                                                            onVote={handleVote}
                                                        />
                                                    ) : msg.metadata?.date ? (
                                                        <EventCard discussion={msg} />
                                                    ) : msg.mediaUrl ? (
                                                        <div className="mt-2 mb-1">
                                                            {msg.mediaType?.startsWith('image/') ? (
                                                                <img
                                                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${msg.mediaUrl}`}
                                                                    alt="Attachment"
                                                                    className="max-w-md max-h-[300px] rounded-xl border border-gray-100 object-cover cursor-pointer hover:opacity-95 shadow-sm transition-all"
                                                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}${msg.mediaUrl}`, '_blank')}
                                                                />
                                                            ) : (
                                                                <a
                                                                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}${msg.mediaUrl}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors w-full max-w-sm group"
                                                                >
                                                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-blue-500 shadow-sm">
                                                                        <File className="w-6 h-6" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 text-left">
                                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                                            {msg.fileName || 'Attached File'}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {msg.fileSize || 'Unknown size'}
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : null}

                                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{msg.content}</p>
                                                    <div className="flex gap-3 mt-1">
                                                        <button
                                                            onClick={() => handleReply(msg)}
                                                            className="text-xs text-gray-400 font-medium hover:text-gray-600"
                                                        >
                                                            Reply
                                                        </button>
                                                        {currentUserId === msg.userId && (
                                                            <button
                                                                onClick={() => handleDelete(msg.id)}
                                                                className="text-xs text-red-400 font-medium hover:text-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Replies - Recursive Nested */}
                                            {msg.replies && msg.replies.length > 0 && (
                                                <div className="ml-12 space-y-3">
                                                    {msg.replies.map(reply => (
                                                        <ReplyItem
                                                            key={reply.id}
                                                            reply={reply}
                                                            parentUser={msg.user?.name?.split(' ')[0]}
                                                            onReply={(r) => handleReply(r)}
                                                            onDelete={handleDelete}
                                                            currentUserId={currentUserId}
                                                            level={1}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {/* Reply Context */}
                            {replyingTo && (
                                <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
                                    <span className="text-sm text-blue-700">
                                        Replying to <strong>@{replyToUser}</strong>
                                    </span>
                                    <button
                                        onClick={() => { setReplyingTo(null); setReplyToUser(null); }}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {/* Input Area */}
                            {/* Answer Area - Modified for Attachments */}
                            <div className="bg-white border-t border-gray-100">
                                {/* Attachment Preview */}
                                {selectedFile && (
                                    <div className="px-4 pt-4 pb-0 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                        <div className="relative inline-block group">
                                            <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 pr-8 min-w-[200px]">
                                                {selectedFile.type.startsWith('image/') ? (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                                                        <img
                                                            src={URL.createObjectURL(selectedFile)}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 border border-blue-100">
                                                        <File className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold text-gray-800 truncate max-w-[150px]">{selectedFile.name}</span>
                                                    <span className="text-[10px] text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 flex gap-2">
                                    <ChatAttachments
                                        onFileSelect={handleFileSelect}
                                        onPollCreate={handlePollCreate}
                                        onEventCreate={handleEventCreate}
                                        disabled={isSending || isUploading}
                                    />
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                        placeholder={replyingTo ? `Reply to ${replyingTo.user?.name}...` : "Type an update or request... (Use @ to tag Depts)"}
                                        className="flex-1 bg-gray-50 border-0 rounded-xl px-4 text-sm focus:ring-2 focus:ring-black/5 focus:bg-white transition-all disabled:opacity-50"
                                        disabled={isSending || isUploading}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || isUploading || (!newMessage.trim() && !selectedFile)}
                                        className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                                    >
                                        {isSending || isUploading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="p-8 h-full overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Task Map</h3>
                                <button
                                    className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                                    onClick={() => setShowAddTaskModal(true)}
                                >
                                    + Add Task
                                </button>
                            </div>

                            {showAddTaskModal && program && (
                                <AddTaskModal
                                    onClose={() => setShowAddTaskModal(false)}
                                    onAdd={handleAddTask}
                                    departments={allDepartments.map(d => d.name)}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-20">
                                {['Pending', 'In Progress', 'Done'].map(status => (
                                    <div
                                        key={status}
                                        className="flex flex-col gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 min-h-[500px]"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleTaskDrop(e, status)}
                                    >
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    status === 'Pending' ? "bg-orange-400" :
                                                        status === 'In Progress' ? "bg-blue-400" : "bg-green-400"
                                                )} />
                                                <h3 className="font-bold text-gray-700 text-sm">{status}</h3>
                                            </div>
                                            <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                                                {tasks.filter(t => (t.group === status) || (status === 'Pending' && !t.group)).length}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-3 flex-1">
                                            {isTaskLoading ? (
                                                <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
                                            ) : tasks
                                                .filter(t => (t.group === status) || (status === 'Pending' && !t.group && t.group !== 'In Progress' && t.group !== 'Done'))
                                                .map(task => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        deptColors={deptColors}
                                                        onDragStart={(e, id) => e.dataTransfer.setData("taskId", id.toString())}
                                                    />
                                                ))}

                                            {tasks.filter(t => (t.group === status) || (status === 'Pending' && !t.group)).length === 0 && !isTaskLoading && (
                                                <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium min-h-[100px]">
                                                    Drop here
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <ResourcesView programId={parseInt(id)} />
                    )}
                </div>
            </div>
        </div>
    )
}

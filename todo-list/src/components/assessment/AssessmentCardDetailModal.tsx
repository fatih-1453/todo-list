"use client"

import * as React from "react"
import { X, Calendar, Clock, Paperclip, MessageSquare, Send, User as UserIcon, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Sparkles } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { assessmentService, Assessment } from "@/services/assessmentService"
import { format } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import * as XLSX from 'xlsx'

interface AssessmentCardDetailModalProps {
    card: Assessment | null
    isOpen: boolean
    onClose: () => void
}

export function AssessmentCardDetailModal({ card, isOpen, onClose }: AssessmentCardDetailModalProps) {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const [commentText, setCommentText] = React.useState("")
    const [currentFileIndex, setCurrentFileIndex] = React.useState(0)
    const [excelData, setExcelData] = React.useState<any[][] | null>(null)

    const addCommentMutation = useMutation({
        mutationFn: async (text: string) => {
            if (!card) throw new Error("No card selected");
            return assessmentService.addComment(card.id, text)
        },
        onMutate: async (newCommentText) => {
            await queryClient.cancelQueries({ queryKey: ['assessments'] })
            const previousAssessments = queryClient.getQueryData(['assessments'])

            queryClient.setQueryData(['assessments'], (old: Assessment[] | undefined) => {
                if (!old || !card) return old
                return old.map(a => {
                    if (a.id === card.id) {
                        const tempComment = {
                            id: Date.now(),
                            text: newCommentText,
                            createdAt: new Date().toISOString(),
                            user: user || { name: 'You' },
                            userId: user?.id
                        }
                        return {
                            ...a,
                            comments: [...(a.comments || []), tempComment]
                        }
                    }
                    return a
                })
            })
            setCommentText("") // Clear input immediately
            return { previousAssessments }
        },
        onError: (err, newComment, context) => {
            queryClient.setQueryData(['assessments'], context?.previousAssessments)
            // Restore text execution if failed? Maybe not needed for simple comment
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] })
        }
    })

    // Reset index when card changes
    React.useEffect(() => {
        setCurrentFileIndex(0)
    }, [card])

    const files = card?.files || []
    const currentFile = files[currentFileIndex]
    const comments = card?.comments || []

    const isImage = (file: any) => file?.type?.startsWith('image/')

    const getFileUrl = (path: string) => {
        // Use relative path for proxy
        return path;
    }

    const loadExcelData = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                setExcelData(jsonData.slice(0, 10)); // Preview first 10 rows
            };
            reader.readAsArrayBuffer(blob);
        } catch (error) {
            console.error("Error loading excel:", error);
            setExcelData(null);
        }
    }

    React.useEffect(() => {
        if (currentFile && (currentFile.name.endsWith('.xlsx') || currentFile.name.endsWith('.xls'))) {
            loadExcelData(getFileUrl(currentFile.path));
        } else {
            setExcelData(null);
        }
    }, [currentFile]);

    if (!card || !isOpen) return null

    const handleSendComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim()) return
        addCommentMutation.mutate(commentText)
    }

    const nextFile = () => {
        setCurrentFileIndex((prev) => (prev + 1) % files.length)
    }

    const prevFile = () => {
        setCurrentFileIndex((prev) => (prev - 1 + files.length) % files.length)
    }

    const renderFilePreview = (file: any) => {
        const url = getFileUrl(file.path);
        const ext = file.name.split('.').pop()?.toLowerCase();
        const isVideo = file.type?.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov'].includes(ext);

        if (isImage(file)) {
            return (
                <img
                    src={url}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain shadow-lg rounded-md"
                />
            );
        }

        if (isVideo) {
            return (
                <video
                    src={url}
                    controls
                    className="max-w-full max-h-full shadow-lg rounded-md bg-black"
                />
            );
        }

        if (ext === 'pdf') {
            return (
                <iframe
                    src={url}
                    className="w-full h-full bg-white rounded-md shadow-lg"
                    title={file.name}
                />
            );
        }

        if (ext === 'xlsx' || ext === 'xls') {
            return (
                <div className="bg-white p-4 rounded-md shadow-lg overflow-auto max-w-full max-h-full w-full">
                    {excelData ? (
                        <table className="min-w-full text-xs text-left text-gray-500">
                            <tbody>
                                {excelData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-b">
                                        {row.map((cell: any, cellIndex: number) => (
                                            <td key={cellIndex} className="px-2 py-1 border-r last:border-r-0 whitespace-nowrap">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex items-center justify-center h-40">
                            <p>Loading spreadsheet...</p>
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center justify-center text-white p-8 bg-white/10 rounded-xl backdrop-blur-sm">
                <FileText className="w-24 h-24 mb-4 opacity-80" />
                <p className="text-lg font-medium">{file.name}</p>
                <p className="text-sm opacity-60 mt-1">{file.type || ext?.toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-2">Preview not available</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-7xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${card.status === 'new' ? 'bg-blue-100 text-blue-700' :
                            card.status === 'progress' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                            {card.status === 'new' ? 'New Request' : card.status === 'progress' ? 'In Progress' : 'Complete'}
                        </div>
                        {card.tag && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.tagColor || 'bg-gray-200 text-gray-600'}`}>
                                {card.tag}
                            </span>
                        )}
                        <h2 className="text-xl font-bold text-gray-900 line-clamp-1 border-l border-gray-300 pl-3 ml-1">
                            {card.title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Action Buttons */}
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Side: Attachments */}
                    <div className={`flex flex-col bg-gray-900 relative ${files.length > 0 ? 'md:w-3/5' : 'hidden'}`}>
                        {files.length > 0 && currentFile && (
                            <>
                                <div className="flex-1 relative flex items-center justify-center p-4 bg-black/40 min-h-0">
                                    {renderFilePreview(currentFile)}

                                    {/* Navigation */}
                                    {files.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevFile}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={nextFile}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-800 text-white flex justify-between items-center z-10 shrink-0">
                                    <div className="overflow-hidden">
                                        <p className="font-medium truncate pr-4" title={currentFile.name}>{currentFile.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {currentFile.size} • {currentFileIndex + 1} of {files.length}
                                        </p>
                                    </div>
                                    <a
                                        href={getFileUrl(currentFile.path)}
                                        target="_blank"
                                        download
                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </a>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className={`flex-1 flex flex-col overflow-y-auto bg-white border-l border-gray-100 ${files.length > 0 ? 'md:w-2/5' : 'w-full'}`}>
                        <div className="p-6 space-y-8 flex-1">
                            {/* Description */}
                            {card.description && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {card.description}
                                    </p>
                                </div>
                            )}

                            {/* Sidebar Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Assignee</p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                            <UserIcon className="w-3 h-3" />
                                        </div>
                                        {card.assignee?.name || 'Unassigned'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {card.dueDate ? format(new Date(card.dueDate), 'MMM d, yyyy') : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Subtasks */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                        Subtasks
                                    </h3>
                                </div>
                                {card.subtasks && card.subtasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {card.subtasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                                    {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No subtasks</p>
                                )}
                            </div>

                            {/* Comments */}
                            <div className="pt-2">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    Comments ({comments.length})
                                </h3>

                                {comments.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-400 italic">No comments yet</p>
                                    </div>
                                ) : (
                                    comments.map((comment: any) => {
                                        const isMe = user?.id === comment.userId || user?.id === comment.user?.id;
                                        return (
                                            <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase ${isMe ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className={`flex-1 flex flex-col space-y-1 max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        <span className="text-sm font-semibold text-gray-900">{isMe ? 'You' : (comment.user?.name || 'Unknown User')}</span>
                                                        <span className="text-xs text-gray-400 mx-2">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                                                    </div>
                                                    <div className={`text-sm p-3 rounded-2xl w-fit ${isMe ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none'}`}>
                                                        {comment.text}
                                                    </div>
                                                    <div className={`flex ${isMe ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                                                        <button
                                                            className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
                                                            onClick={() => setCommentText(`@${comment.user?.name || 'User'} `)}
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Add Comment Input */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                            <form onSubmit={handleSendComment} className="relative">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || addCommentMutation.isPending}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

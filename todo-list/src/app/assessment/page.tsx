"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import {
    Plus,
    MoreHorizontal,
    CheckCircle2,
    Loader2,
    Trash2
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assessmentService, Assessment } from "@/services/assessmentService"
import { CreateAssessmentModal } from "@/components/assessment/CreateAssessmentModal"
import { AssessmentCardDetailModal } from "@/components/assessment/AssessmentCardDetailModal"
import { Paperclip, MessageSquare, FileText } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AssessmentPage() {
    const [createModal, setCreateModal] = useState<{ open: boolean, status: 'new' | 'acc_direksi' | 'progress' | 'complete' }>({ open: false, status: 'new' })
    const [selectedCard, setSelectedCard] = useState<Assessment | null>(null)
    const queryClient = useQueryClient()

    const { data: assessments, isLoading } = useQuery({
        queryKey: ['assessments'],
        queryFn: assessmentService.getAll
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: 'new' | 'acc_direksi' | 'progress' | 'complete' }) =>
            assessmentService.updateStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessments'] })
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => assessmentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] })
            setSelectedCard(null)
        }
    })

    const toggleSubtaskMutation = useMutation({
        mutationFn: ({ id, completed }: { id: number, completed: boolean }) =>
            assessmentService.toggleSubtask(id, completed),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessments'] })
    })

    const columns = [
        { id: "new", title: "New Requests", color: "bg-purple-500", status: 'new' as const },
        { id: "acc_direksi", title: "Acc Direksi", color: "bg-rose-500", status: 'acc_direksi' as const },
        { id: "progress", title: "In Progress", color: "bg-blue-500", status: 'progress' as const },
        { id: "complete", title: "Complete", color: "bg-green-500", status: 'complete' as const }
    ]

    const getColumnCards = (status: string) => {
        return assessments?.filter(a => a.status === status) || []
    }

    const handleMove = (id: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'new' ? 'acc_direksi' :
            currentStatus === 'acc_direksi' ? 'progress' :
                currentStatus === 'progress' ? 'complete' : 'new';
        updateStatusMutation.mutate({ id, status: nextStatus as any })
    }

    const activeCard = useMemo(() => {
        if (!selectedCard || !assessments) return null;
        return assessments.find(a => a.id === selectedCard.id) || null;
    }, [selectedCard, assessments]);

    return (
        <main className="flex h-screen bg-[#F7F8FA] text-gray-900 font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />

                {/* Fixed Header */}
                <div className="flex justify-between items-center px-4 md:px-8 py-6 bg-[#F7F8FA] flex-shrink-0">
                    <h1 className="text-2xl font-bold">Assessments</h1>
                    <button
                        onClick={() => setCreateModal({ open: true, status: 'new' })}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Assessment
                    </button>
                </div>

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-none">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="flex gap-4 sm:gap-6 min-w-max h-full pb-6">
                            {columns.map((column) => (
                                <Column
                                    key={column.id}
                                    title={column.title}
                                    cards={getColumnCards(column.status)}
                                    onMoveCard={handleMove}
                                    onAddCard={() => setCreateModal({ open: true, status: column.status })}
                                    onDeleteCard={(id) => deleteMutation.mutate(id)}
                                    onToggleSubtask={(id, completed) => toggleSubtaskMutation.mutate({ id, completed })}
                                    onCardClick={(card) => setSelectedCard(card)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateAssessmentModal
                isOpen={createModal.open}
                onClose={() => setCreateModal(prev => ({ ...prev, open: false }))}
                defaultStatus={createModal.status}
            />

            <AssessmentCardDetailModal
                card={activeCard}
                isOpen={!!activeCard}
                onClose={() => setSelectedCard(null)}
            />
        </main>
    )
}

function Column({ title, cards, onMoveCard, onAddCard, onDeleteCard, onToggleSubtask, onCardClick }: {
    title: string,
    cards: Assessment[],
    onMoveCard: (id: number, status: string) => void,
    onAddCard: () => void,
    onDeleteCard: (id: number) => void,
    onToggleSubtask: (id: number, completed: boolean) => void,
    onCardClick: (card: Assessment) => void
}) {
    return (
        <div className="w-[340px] flex-shrink-0 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-700 text-sm">{title}</h2>
                    <span className="text-xs text-gray-400 font-medium">{cards.length}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                    <button onClick={onAddCard} className="p-1 hover:bg-gray-200 rounded">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-3 pb-8 overflow-y-auto scrollbar-none pr-1">
                {cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        onMove={() => onMoveCard(card.id, card.status)}
                        onDelete={() => onDeleteCard(card.id)}
                        onToggleSubtask={onToggleSubtask}
                        onClick={() => onCardClick(card)}
                    />
                ))}

                <button
                    onClick={onAddCard}
                    className="flex items-center gap-2 text-gray-400 text-sm p-1 hover:text-gray-600 transition-colors w-full"
                >
                    <Plus className="w-4 h-4" />
                    Add subtask (Card)
                </button>
            </div>
        </div>
    )
}

function Card({ card, onMove, onDelete, onToggleSubtask, onClick }: {
    card: Assessment,
    onMove: () => void,
    onDelete: () => void,
    onToggleSubtask: (id: number, completed: boolean) => void,
    onClick: () => void
}) {
    // Check if card has video or image for cover
    const videoFile = card.files?.find(f => f.type.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov'].includes(f.name.split('.').pop()?.toLowerCase() || ''));
    const imageFile = card.files?.find(f => f.type.startsWith('image/'));

    // Check for documents
    const docFile = card.files?.find(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext || '') ||
            f.type.includes('pdf') ||
            f.type.includes('word') ||
            f.type.includes('sheet') ||
            f.type.includes('excel');
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    const coverUrl = card.cover || (imageFile ? `${baseUrl}${imageFile.path}` : null);
    const hasVideo = !!videoFile;
    const hasDoc = !!docFile && !coverUrl && !hasVideo;

    const getDocIcon = (file: any) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf' || file.type.includes('pdf')) return <FileText className="w-10 h-10 text-red-500" />;
        if (['xls', 'xlsx'].includes(ext) || file.type.includes('sheet') || file.type.includes('excel')) return <FileText className="w-10 h-10 text-green-600" />; // Or specific sheet icon if available
        if (['doc', 'docx'].includes(ext) || file.type.includes('word')) return <FileText className="w-10 h-10 text-blue-600" />;
        return <FileText className="w-10 h-10 text-gray-500" />;
    }

    // Smart Priority Logic
    const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() && card.status !== 'complete' : false
    const isHighPriority = card.tag?.toLowerCase().includes('urgent') || card.tag?.toLowerCase().includes('priority')

    return (
        <div
            className={`bg-white rounded-xl p-5 shadow-sm border transition-shadow cursor-pointer select-none group relative flex flex-col gap-3 ${isOverdue ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100 hover:shadow-md'}`}
            onClick={onClick}
        >
            {/* Smart Priority Warning */}
            {(isOverdue || isHighPriority) && (
                <div className="absolute -top-2 -right-2 z-20">
                    <span className={`flex h-4 w-4 relative`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOverdue ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-4 w-4 text-[10px] items-center justify-center text-white font-bold ${isOverdue ? 'bg-red-500' : 'bg-amber-500'}`}>!</span>
                    </span>
                </div>
            )}

            {/* Delete Menu */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 hover:bg-gray-100 rounded focus:outline-none">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Cover Image / Video / Doc Preview */}
            {(coverUrl || hasVideo || hasDoc) && (
                <div className="-mx-5 -mt-5 mb-0 h-36 overflow-hidden rounded-t-xl relative bg-gray-100 group-card flex items-center justify-center">
                    {coverUrl ? (
                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : hasVideo ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                <span className="ml-1 border-y-[6px] border-y-transparent border-l-[10px] border-l-blue-600"></span>
                            </div>
                        </div>
                    ) : hasDoc && docFile ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                {getDocIcon(docFile)}
                            </div>
                            <span className="text-xs font-semibold text-gray-500 max-w-[150px] truncate px-2">{docFile.name}</span>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Header: Check & Title */}
            <div className="flex items-start gap-3">
                <div
                    onClick={(e) => { e.stopPropagation(); onMove(); }}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${card.status === 'complete'
                        ? "border-purple-500 bg-purple-500 text-white"
                        : "border-gray-300 hover:border-purple-500 text-transparent"
                        }`}
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                </div>

                <h3 className={`text-[15px] font-semibold leading-tight ${card.status === 'complete' ? "text-gray-400 line-through" : "text-gray-800"}`}>
                    {card.title}
                </h3>
            </div>

            {/* Tags */}
            {card.tag && (
                <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${card.tagColor || 'bg-orange-100 text-orange-600'}`}>
                        {card.tag}
                    </span>
                </div>
            )}

            {/* Subtasks Preview */}
            {card.subtasks && card.subtasks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                    {card.subtasks.slice(0, 3).map((task) => (
                        <div
                            key={task.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSubtask(task.id, !task.completed);
                            }}
                            className="flex items-center gap-2.5 group/task cursor-pointer pl-1"
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover/task:border-gray-400'
                                }`}>
                                {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                {task.text}
                            </span>
                        </div>
                    ))}
                    {card.subtasks.length > 3 && (
                        <p className="text-xs text-gray-400 pl-8">+ {card.subtasks.length - 3} more subtasks</p>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(); // Open modal
                        }}
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-medium pl-1 pt-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add subtask
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 mt-auto">
                <div className="flex items-center gap-2">
                    {card.assignee ? (
                        <div className="flex items-center gap-2">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(card.assignee.name)}&background=random`}
                                alt={card.assignee.name}
                                className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs text-gray-500 font-medium">
                                {card.dueDate ? new Date(card.dueDate).toLocaleDateString(undefined, { weekday: 'long' }) : 'Today'}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                    {/* Comments Count */}
                    {(card.comments && card.comments.length > 0) && (
                        <div className="relative flex items-center justify-center w-6 h-6 text-gray-400 group">
                            <MessageSquare className="w-4 h-4" />
                            {/* Notification Badge */}
                            <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full border border-white shadow-sm z-10">
                                {card.comments.length}
                            </div>

                            {/* Tooltip Popup */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase">
                                        {card.comments[0]?.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-xs font-bold text-gray-900 truncate">
                                                {card.comments[0]?.user?.name || 'Unknown'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                {new Date(card.comments[0]?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {card.comments[0]?.text}
                                        </p>
                                    </div>
                                </div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
                            </div>
                        </div>
                    )}
                    {/* Files Count */}
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold">{(card.files?.length || 0)}</span>
                        <Paperclip className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </div>
    )
}

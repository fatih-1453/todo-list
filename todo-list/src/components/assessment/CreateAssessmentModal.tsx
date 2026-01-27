"use client"

import * as React from "react"
import { X, Calendar as CalendarIcon, Loader2, Check, Upload, Paperclip, FileText, Sparkles, Plus } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { assessmentService } from "@/services/assessmentService"

import { Input } from "@/components/ui/input"

interface CreateAssessmentModalProps {
    isOpen: boolean
    onClose: () => void
    defaultStatus?: 'new' | 'acc_direksi' | 'progress' | 'complete'
}

export function CreateAssessmentModal({ isOpen, onClose, defaultStatus = 'new' }: CreateAssessmentModalProps) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = React.useState({
        title: "",
        tag: "",
        tagColor: "",
        dueDate: "",
        description: "",
        subtasks: [] as string[],
        assigneeId: ""
    })
    const [subtaskInput, setSubtaskInput] = React.useState("")
    const [files, setFiles] = React.useState<File[]>([])
    const [isGenerating, setIsGenerating] = React.useState(false) // For AI simulation
    const [isSuccess, setIsSuccess] = React.useState(false)

    // Predefined colors for random assignment if no specific logic
    const TAG_COLORS = [
        "bg-emerald-100 text-emerald-600",
        "bg-orange-100 text-orange-600",
        "bg-purple-100 text-purple-600",
        "bg-blue-100 text-blue-600",
        "bg-pink-100 text-pink-600"
    ]

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const formDataObj = new FormData()
            formDataObj.append('title', data.title)
            formDataObj.append('status', defaultStatus)
            if (data.tag) formDataObj.append('tag', data.tag)
            if (data.tagColor) formDataObj.append('tagColor', data.tagColor)
            if (data.dueDate) formDataObj.append('dueDate', data.dueDate)
            if (data.description) formDataObj.append('description', data.description)
            if (data.subtasks) formDataObj.append('subtasks', JSON.stringify(data.subtasks))

            files.forEach(file => {
                formDataObj.append('files', file)
            })

            return assessmentService.create(formDataObj)
        },
        onSuccess: () => {
            setIsSuccess(true)
            queryClient.invalidateQueries({ queryKey: ['assessments'] })

            setTimeout(() => {
                onClose()
                resetForm()
            }, 1000)
        }
    })

    const resetForm = () => {
        setFormData({
            title: "",
            tag: "",
            tagColor: "",
            dueDate: "",
            description: "",
            subtasks: [],
            assigneeId: ""
        })
        setSubtaskInput("")
        setFiles([])
        setIsSuccess(false)
        setIsGenerating(false)
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormData(prev => ({ ...prev, title: value }))

        // Smart Auto-Tagging Logic
        const lowerTitle = value.toLowerCase()
        if (lowerTitle.includes("design") || lowerTitle.includes("ui") || lowerTitle.includes("ux")) {
            setFormData(prev => ({ ...prev, tag: "Design", tagColor: "bg-pink-100 text-pink-600" }))
        } else if (lowerTitle.includes("video") || lowerTitle.includes("reels") || lowerTitle.includes("content")) {
            setFormData(prev => ({ ...prev, tag: "Creative", tagColor: "bg-purple-100 text-purple-600" }))
        } else if (lowerTitle.includes("bug") || lowerTitle.includes("fix") || lowerTitle.includes("error")) {
            setFormData(prev => ({ ...prev, tag: "Technical", tagColor: "bg-red-100 text-red-600" }))
        } else if (lowerTitle.includes("meeting") || lowerTitle.includes("discuss")) {
            setFormData(prev => ({ ...prev, tag: "Meeting", tagColor: "bg-blue-100 text-blue-600" }))
        }
    }

    const handleGenerateSubtasks = () => {
        setIsGenerating(true)
        // Simulated AI Delay
        setTimeout(() => {
            const lowerTitle = formData.title.toLowerCase()
            let newSubtasks: string[] = []

            if (lowerTitle.includes("video") || lowerTitle.includes("content")) {
                newSubtasks = ["Draft scripts", "Prepare storyboard", "Shoot footage", "Edit video", "Review & Render"]
            } else if (lowerTitle.includes("design")) {
                newSubtasks = ["Gather moodboard", "Sketch concepts", "Create high-fidelity UI", "Prototype interactions", "Design review"]
            } else if (lowerTitle.includes("event") || lowerTitle.includes("bukber")) {
                newSubtasks = ["Find venue", "Calculate budget", "List guests", "Order food", "Send invitations"]
            } else {
                newSubtasks = ["Research topic", "Draft outline", "Review requirements", "Implementation", "Final testing"]
            }

            setFormData(prev => ({ ...prev, subtasks: [...(prev.subtasks || []), ...newSubtasks] }))
            setIsGenerating(false)
        }, 800)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)])

            // Smart Doc Summary (Simulated)
            const file = e.target.files[0]
            if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
                // Determine context from filename for "Smart Analysis"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const context = file.name.includes("proposal") ? "Business Proposal" :
                    file.name.includes("report") ? "Monthly Report" : "Document";

                // Append a "system note" about the analysis (simulated by adding to subtasks or description if we had one, 
                // but here we'll just add a special subtask or maybe auto-tag)
                setTimeout(() => {
                    setFormData(prev => ({ ...prev, tag: "Review Needed", tagColor: "bg-amber-100 text-amber-700" }))
                }, 500)
            }
        }
    }

    const addSubtask = () => {
        if (!subtaskInput.trim()) return
        setFormData(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, subtaskInput]
        }))
        setSubtaskInput("")
    }

    const removeSubtask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Assessment</h2>
                    <p className="text-sm text-gray-500 mt-1">Add a new assessment card to the board</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="e.g., Q1 Marketing Assessment"
                            className="w-full bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                Tag
                            </label>
                            <Input
                                value={formData.tag || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                                placeholder="e.g., Marketing"
                                className="w-full bg-gray-50/50 border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                Tag Color
                            </label>
                            <select
                                value={formData.tagColor || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, tagColor: e.target.value }))}
                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="">Default (Orange)</option>
                                <option value="bg-blue-100 text-blue-600">Blue</option>
                                <option value="bg-green-100 text-green-600">Green</option>
                                <option value="bg-purple-100 text-purple-600">Purple</option>
                                <option value="bg-red-100 text-red-600">Red</option>
                                <option value="bg-pink-100 text-pink-600">Pink</option>
                                <option value="bg-amber-100 text-amber-700">Amber</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="date"
                                value={formData.dueDate || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="w-full pl-9 bg-gray-50/50 border-gray-200"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                Subtasks
                            </label>
                            <button
                                type="button"
                                onClick={handleGenerateSubtasks}
                                disabled={!formData.title || isGenerating}
                                className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors font-medium bg-purple-50 px-2 py-1 rounded-md"
                            >
                                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                {isGenerating ? "Generating..." : "AI Generate"}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.subtasks?.map((task, index) => (
                                <div key={index} className="flex items-center gap-2 group">
                                    <div className="flex-1 bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-600 border border-gray-100">
                                        {task}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSubtask(index)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Input
                                    value={subtaskInput}
                                    onChange={(e) => setSubtaskInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                    placeholder="Add a subtask..."
                                    className="flex-1 bg-gray-50/50 border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Files Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>

                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <Upload className="w-6 h-6" />
                                <span className="text-xs">
                                    {files.length > 0
                                        ? `${files.length} file(s) selected`
                                        : "Click or Drag files here (PDF, Doc, Images, Video)"}
                                </span>
                            </div>
                        </div>
                        {/* File List Preview */}
                        {
                            files.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <Paperclip className="w-3 h-3" />
                                            <span className="truncate flex-1">{f.name}</span>
                                            <span>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={!formData.title.trim() || createMutation.isPending || isSuccess}
                            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isSuccess
                                ? "bg-green-500 text-white"
                                : "bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                                }`}
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Created!
                                </>
                            ) : (
                                "Create Card"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

"use client"

import * as React from "react"
import { X, Calendar as CalendarIcon, Loader2, Check, Sparkles, Building2, Plus, Users, User, ChevronDown, HelpCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { programService, Program } from "@/services/programService"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CreateProgramModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (program: Program) => void
}

export function CreateProgramModal({ isOpen, onClose, onCreate, programToEdit }: CreateProgramModalProps & { programToEdit?: Program }) {
    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        startDate: "",
        deadline: "",
        departments: [] as string[],
        color: "bg-purple-600",
        category: "General",
        status: "Active",
        projectManager: ""
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Reset or Populate form on open
    React.useEffect(() => {
        if (isOpen) {
            if (programToEdit) {
                setFormData({
                    title: programToEdit.title,
                    description: programToEdit.description || "",
                    startDate: programToEdit.startDate ? new Date(programToEdit.startDate).toISOString().split('T')[0] : "",
                    deadline: programToEdit.deadline ? new Date(programToEdit.deadline).toISOString().split('T')[0] : "",
                    departments: programToEdit.departments || [],
                    color: programToEdit.color || "bg-purple-600",
                    category: programToEdit.category || "General",
                    status: programToEdit.status,
                    projectManager: programToEdit.projectManager || ""
                })
            } else {
                setFormData({
                    title: "",
                    description: "",
                    startDate: "",
                    deadline: "",
                    departments: [],
                    color: "bg-purple-600",
                    category: "General",
                    status: "Active",
                    projectManager: ""
                })
            }
        }
    }, [isOpen, programToEdit])

    // Predefined departments for "Assignees"
    const DEPARTMENTS = ["Logistics", "IT", "Medical", "Transport", "HR", "Finance", "Events", "Creative", "Engineering", "Security"]
    // Mock Users for Project Manager
    const MANAGERS = ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis", "Michael Wilson"]

    const COLORS = [
        "bg-red-500", "bg-pink-600", "bg-purple-600", "bg-indigo-600", "bg-blue-700", "bg-blue-500", "bg-cyan-500",
        "bg-teal-500", "bg-emerald-600", "bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-amber-400", "bg-orange-500",
        "bg-orange-600", "bg-amber-700", "bg-gray-600", "bg-slate-600"
    ]
    const [categories] = React.useState(["Management", "General"])

    const STATUSES = ["Active", "Planning", "Completed", "Archived", "On Hold"]

    const [templates, setTemplates] = React.useState<Program[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("")

    React.useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const allPrograms = await programService.getAll()
                setTemplates(allPrograms.filter(p => p.isTemplate))
            } catch (error) {
                console.error("Failed to fetch templates", error)
            }
        }
        if (isOpen && !programToEdit) fetchTemplates() // Only fetch templates for new programs
    }, [isOpen, programToEdit])

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId)
        if (!templateId) return

        const template = templates.find(t => t.id.toString() === templateId)
        if (template) {
            setFormData(prev => ({
                ...prev,
                title: template.title.replace(" (Template)", ""), // Remove suffix
                description: template.description || "",
                departments: template.departments || [],
                color: template.color || "bg-purple-600",
                category: template.category || "Uncategorized",
                status: "Planning" // Reset status
            }))
        }
    }

    const toggleDepartment = (dept: string) => {
        setFormData(prev => ({
            ...prev,
            departments: prev.departments.includes(dept)
                ? prev.departments.filter(d => d !== dept)
                : [...prev.departments, dept]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title) return

        setIsSubmitting(true)

        try {
            let resultProgram: Program;
            const programData = {
                title: formData.title,
                description: formData.description,
                startDate: formData.startDate || undefined,
                deadline: formData.deadline || undefined,
                departments: formData.departments,
                status: formData.status,
                color: formData.color,
                category: formData.category,
                progress: programToEdit ? programToEdit.progress : 0,
                projectManager: formData.projectManager,
            };

            if (programToEdit) {
                resultProgram = await programService.update(programToEdit.id, programData)
                toast.success("Program updated successfully")
            } else {
                resultProgram = await programService.create(programData)
                toast.success("Program created successfully")
            }

            onCreate(resultProgram) // Should ideally be named onSave
            onClose()
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to save program")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 scale-100">
                {/* Header - Minimalist */}
                <div className="px-6 py-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{programToEdit ? "Edit project" : "Add project"}</h2>
                    <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                            <HelpCircle className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Template Selection - Subtle */}
                    {templates.length > 0 && (
                        <div className="relative group">
                            <select
                                value={selectedTemplateId}
                                onChange={e => handleTemplateSelect(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-purple-50/50 border border-purple-100/50 rounded-lg text-xs text-purple-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 appearance-none cursor-pointer hover:bg-purple-50 transition-colors"
                            >
                                <option value="">✨ Start from Template</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-400 pointer-events-none group-hover:text-purple-600 transition-colors" />
                        </div>
                    )}

                    {/* Title Input - Prominent */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Title</label>
                        <div className="relative flex items-center group">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button type="button" className="absolute left-3 flex items-center gap-1.5 hover:bg-gray-50 p-1.5 -ml-1.5 rounded-md transition-colors outline-none focus:ring-2 focus:ring-blue-100">
                                        <div className={cn("w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-black/5", formData.color)}></div>
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64 p-3 grid grid-cols-6 gap-2">
                                    {COLORS.map((color, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                            className={cn(
                                                "w-6 h-6 rounded-full hover:scale-110 transition-transform relative flex items-center justify-center shadow-sm",
                                                color,
                                                formData.color === color && "ring-2 ring-black ring-offset-2"
                                            )}
                                        />
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Input
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="pl-12 h-11 border-gray-200 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-base transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                                placeholder="Project Name"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Description - Clean */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full min-h-[80px] px-4 py-3 border border-gray-200 bg-white shadow-sm rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all placeholder:text-gray-400"
                            placeholder="Add a brief description..."
                        />
                    </div>

                    {/* Assignees - Avatars */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Assignees</label>
                        <div className="flex items-center flex-wrap gap-2 min-h-[40px]">
                            {formData.departments.map((dept, i) => (
                                <div key={i} className="group relative flex items-center justify-center">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white cursor-help">
                                        {dept.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        {dept}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => toggleDepartment(dept)}
                                        className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button type="button" className="w-9 h-9 rounded-full border border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-all shadow-sm bg-white">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52 max-h-60 overflow-y-auto p-2">
                                    <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Departments</DropdownMenuLabel>

                                    {DEPARTMENTS.map(dept => (
                                        <DropdownMenuItem
                                            key={dept}
                                            onClick={() => toggleDepartment(dept)}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg mb-1",
                                                formData.departments.includes(dept) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            <span className="text-sm font-medium">{dept}</span>
                                            {formData.departments.includes(dept) && <Check className="w-4 h-4" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Start Date</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className={cn(
                                        "w-full pl-3 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all",
                                        !formData.startDate && "text-gray-400"
                                    )}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Due Date</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                    className={cn(
                                        "w-full pl-3 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all",
                                        !formData.deadline && "text-gray-400"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Category</label>
                            <div className="relative">
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white font-medium text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-all"
                                >
                                    <option value="General">Semua Akun (General)</option>
                                    <option value="Management">Direksi & Manager (Management)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Status</label>
                            <div className="relative">
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white font-medium text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-all"
                                >
                                    {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Footer - Minimal */}
                    <div className="pt-6 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={!formData.title || isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 text-sm sm:text-base active:scale-95"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (programToEdit ? "Update" : "Next")}
                            {!isSubmitting && <span className="text-lg leading-none transform translate-y-[-1px]">→</span>}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm sm:text-base active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

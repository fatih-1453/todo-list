"use client"

import * as React from "react"
import {
    Plus,
    Filter,
    Search,
    LayoutGrid,
    List,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/Sidebar"
import { CreateProgramModal } from "@/components/programs/CreateProgramModal"
import { programService, Program } from "@/services/programService"
import { apiClient } from "@/lib/api-client"
import { DashboardStats } from "@/components/programs/DashboardStats"
import { ProgramCard } from "@/components/programs/ProgramCard"
import { format } from "date-fns"
import Link from "next/link" // Added missing import
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ExternalLink, Edit2, Trash2, Archive, Copy, Layout, Star, Check } from "lucide-react" // Added missing imports for Table view

export default function ProgramsPage() {
    const [programs, setPrograms] = React.useState<Program[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    const [user, setUser] = React.useState<any>(null)
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("All")
    const [programType, setProgramType] = React.useState<'active' | 'templates'>('active')

    // Fetch programs and users from API
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const [programsData, userData] = await Promise.all([
                    programService.getAll(),
                    apiClient.get('/users/me').catch(() => null)
                ])
                setPrograms(programsData)
                setUser(userData)
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const [editingProgram, setEditingProgram] = React.useState<Program | undefined>(undefined)

    const handleCreateProgram = (newProgram: Program) => {
        setPrograms(prev => {
            const exists = prev.find(p => p.id === newProgram.id)
            if (exists) {
                return prev.map(p => p.id === newProgram.id ? newProgram : p)
            }
            return [newProgram, ...prev]
        })
        setEditingProgram(undefined)
    }

    const handleEditClick = (program: Program) => {
        setEditingProgram(program)
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this program?')) return
        try {
            await programService.delete(id)
            setPrograms(prev => prev.filter(p => p.id !== id))
            toast.success("Program deleted")
        } catch (error) {
            console.error('Failed to delete program:', error)
            toast.error("Failed to delete program")
        }
    }

    const handleArchive = async (id: number) => {
        try {
            await programService.update(id, { status: "Archived" })
            setPrograms(prev => prev.map(p => p.id === id ? { ...p, status: "Archived" } : p))
            toast.success("Program archived")
        } catch (error) {
            console.error('Failed to archive program:', error)
            toast.error("Failed to archive program")
        }
    }

    const handleDuplicate = async (program: Program) => {
        try {
            const newProgram = await programService.create({
                title: `${program.title} (Copy)`,
                status: "Planning",
                deadline: program.deadline || undefined,
                departments: program.departments,
                description: program.description || undefined,
                color: program.color || undefined
            })
            setPrograms(prev => [newProgram, ...prev])
            toast.success("Program duplicated successfully")
        } catch (error) {
            console.error('Failed to duplicate program:', error)
            toast.error("Failed to duplicate program")
        }
    }

    const handleSaveAsTemplate = async (program: Program) => {
        try {
            const template = await programService.create({
                title: `${program.title} (Template)`,
                status: "Planning",
                deadline: undefined,
                departments: program.departments,
                description: program.description || undefined,
                color: program.color || undefined,
                isTemplate: true
            })
            setPrograms(prev => [template, ...prev])
            setProgramType('templates')
            toast.success("Template created from program")
        } catch (error) {
            console.error('Failed to create template:', error)
            toast.error("Failed to save as template")
        }
    }

    const handleColorChange = async (id: number, color: string) => {
        try {
            setPrograms(prev => prev.map(p => p.id === id ? { ...p, color } : p))
            await programService.update(id, { color })
        } catch (error) {
            console.error('Failed to update color:', error)
            toast.error("Failed to update color")
        }
    }

    // Filter Logic
    const filteredPrograms = programs.filter(p => {
        const matchesType = programType === 'active' ? !p.isTemplate : p.isTemplate
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.projectManager?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "All" || p.status === statusFilter

        return matchesType && matchesSearch && matchesStatus
    })

    const managementPrograms = filteredPrograms.filter(p => p.category === 'Management')
    const generalPrograms = filteredPrograms.filter(p => p.category !== 'Management')

    // Role Check
    const userRole = user?.role?.toLowerCase() || '';
    const canViewManagement = ['admin', 'owner', 'direksi', 'manager'].includes(userRole);

    const ProgramGrid = ({ title, programs }: { title: string, programs: Program[] }) => (
        <div className="mb-10">
            <h3 className="px-1 pb-4 text-lg font-bold text-gray-800 flex items-center gap-2">
                {title}
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{programs.length}</span>
            </h3>
            {programs.length === 0 ? (
                <div className="p-8 text-center bg-gray-100/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    No programs found in {title}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {programs.map(program => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                            onDuplicate={handleDuplicate}
                            onSaveTemplate={handleSaveAsTemplate}
                            onColorChange={handleColorChange}
                        />
                    ))}
                </div>
            )}
        </div>
    )

    // Using the original table structure for List View
    const COLORS = [
        "bg-red-500", "bg-pink-600", "bg-purple-600", "bg-indigo-600", "bg-blue-700", "bg-blue-500", "bg-cyan-500",
        "bg-teal-500", "bg-emerald-600", "bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-amber-400", "bg-orange-500",
        "bg-orange-600", "bg-amber-700", "bg-gray-600", "bg-slate-600"
    ]

    const ProgramTable = ({ title, programs }: { title: string, programs: Program[] }) => (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {title}
                    <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{programs.length}</span>
                </h3>
            </div>
            <div className="w-full text-left border-collapse overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 text-xs text-gray-500 font-semibold uppercase tracking-wider bg-gray-50/30">
                            <th className="w-10 py-3 pl-6"></th>
                            <th className="py-3 px-4 text-left">Title</th>
                            <th className="py-3 px-4 text-left w-48">Created By</th>
                            <th className="py-3 px-4 text-center w-32">Dept</th>
                            <th className="py-3 px-4 text-center w-32">Start</th>
                            <th className="py-3 px-4 text-center w-32">End</th>
                            <th className="py-3 px-4 text-center w-32">Status</th>
                            <th className="py-3 px-4 text-center w-32">Manager</th>
                            <th className="py-3 px-4 text-center w-32">Assignees</th>
                            <th className="w-10 py-3 pr-6"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {programs.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-8 text-center text-gray-400 italic">
                                    No programs in {title}
                                </td>
                            </tr>
                        ) : (
                            programs.map((program) => (
                                <tr key={program.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                                    <td className="py-3 pl-6">
                                        <div className={cn("w-3 h-3 rounded-full", program.color)}></div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Link href={`./programs/${program.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                            {program.title}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 overflow-hidden">
                                                {program.creator?.image ? (
                                                    <img src={program.creator.image} alt={program.creator.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (program.creator?.name || '?')[0]
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 truncate max-w-[100px]" title={program.creator?.name}>
                                                {program.creator?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-500 text-xs">
                                        {program.creator?.employee?.department || '-'}
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-500 text-xs">
                                        {program.startDate ? format(new Date(program.startDate), 'MMM d') : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-500 text-xs">
                                        {program.deadline ? format(new Date(program.deadline), 'MMM d') : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-semibold border",
                                            program.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                program.status === 'Planning' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                    "bg-gray-50 text-gray-600 border-gray-100"
                                        )}>
                                            {program.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex justify-center" title={program.projectManager || 'Unassigned'}>
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                                                {(program.projectManager || '?')[0]}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex justify-center -space-x-1 hover:space-x-0 transition-all">
                                            {(program.departments || []).slice(0, 3).map((dept, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white text-gray-600 flex items-center justify-center text-[10px] font-bold uppercase" title={dept}>
                                                    {dept[0]}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 pr-6 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuItem onClick={() => window.open(`./programs/${program.id}`, '_blank')} className="gap-2">
                                                    <ExternalLink className="w-4 h-4" /> Open in new tab
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEditClick(program)} className="gap-2">
                                                    <Edit2 className="w-4 h-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(program.id)} className="gap-2 text-red-500">
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleArchive(program.id)} className="gap-2">
                                                    <Archive className="w-4 h-4" /> Archive
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicate(program)} className="gap-2">
                                                    <Copy className="w-4 h-4" /> Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSaveAsTemplate(program)} className="gap-2">
                                                    <Layout className="w-4 h-4" /> Save as Template
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <div className="p-2 grid grid-cols-6 gap-1">
                                                    {COLORS.map((color, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleColorChange(program.id, color);
                                                            }}
                                                            className={cn(
                                                                "w-4 h-4 rounded-full hover:scale-110",
                                                                color,
                                                                program.color === color && "ring-2 ring-black ring-offset-1"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans text-gray-900">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white shrink-0 z-10 sticky top-0 shadow-sm">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Programs Hub</h1>

                        <div className="h-6 w-px bg-gray-200"></div>

                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setProgramType('active')}
                                className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", programType === 'active' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                            >
                                Active Projects
                            </button>
                            <button
                                onClick={() => setProgramType('templates')}
                                className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", programType === 'templates' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                            >
                                Templates
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700")}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-64 transition-all"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setEditingProgram(undefined)
                                setIsCreateModalOpen(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Project</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-8">
                    {programType === 'active' && <DashboardStats programs={filteredPrograms} />}

                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {viewMode === 'grid' ? (
                                <>
                                    {canViewManagement && (
                                        <ProgramGrid title="Management & Directory" programs={managementPrograms} />
                                    )}
                                    <ProgramGrid title="All Projects" programs={generalPrograms} />
                                </>
                            ) : (
                                <>
                                    {canViewManagement && (
                                        <ProgramTable title="Management & Directory" programs={managementPrograms} />
                                    )}
                                    <ProgramTable title="All Projects" programs={generalPrograms} />
                                </>
                            )}
                        </div>
                    )}
                </div>

                <CreateProgramModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateProgram}
                    programToEdit={editingProgram}
                />
            </div>
        </div>
    )
}

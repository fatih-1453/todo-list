"use client"

import { Program } from "@/services/programService"
import { format } from "date-fns"
import { MoreHorizontal, ExternalLink, Edit2, Trash2, Archive, Copy, Layout, Check, Calendar, Users, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProgramCardProps {
    program: Program
    onEdit: (program: Program) => void
    onDelete: (id: number) => void
    onArchive: (id: number) => void
    onDuplicate: (program: Program) => void
    onSaveTemplate: (program: Program) => void
    onColorChange: (id: number, color: string) => void
}

export function ProgramCard({
    program,
    onEdit,
    onDelete,
    onArchive,
    onDuplicate,
    onSaveTemplate,
    onColorChange
}: ProgramCardProps) {
    const COLORS = [
        "bg-red-500", "bg-pink-600", "bg-purple-600", "bg-indigo-600", "bg-blue-700", "bg-blue-500", "bg-cyan-500",
        "bg-teal-500", "bg-emerald-600", "bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-amber-400", "bg-orange-500",
        "bg-orange-600", "bg-amber-700", "bg-gray-600", "bg-slate-600"
    ]

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full">
            {/* Color Strip */}
            <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-xl", program.color || "bg-gray-200")} />

            <div className="flex justify-between items-start mb-3 mt-1">
                <div className="flex gap-2">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0",
                        program.color || "bg-gray-500"
                    )}>
                        <Star className="w-5 h-5 fill-white/20" />
                    </div>
                    <div>
                        <Link href={`./programs/${program.id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 block" title={program.title}>
                            {program.title}
                        </Link>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            {program.category || "General"}
                        </p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => window.open(`./programs/${program.id}`, '_blank')} className="gap-2">
                            <ExternalLink className="w-4 h-4" /> Open in new tab
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(program)} className="gap-2">
                            <Edit2 className="w-4 h-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(program.id)} className="gap-2 text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onArchive(program.id)} className="gap-2">
                            <Archive className="w-4 h-4" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(program)} className="gap-2">
                            <Copy className="w-4 h-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSaveTemplate(program)} className="gap-2">
                            <Layout className="w-4 h-4" /> Save as Template
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className="p-2 grid grid-cols-6 gap-1">
                            {COLORS.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onColorChange(program.id, color)
                                    }}
                                    className={cn(
                                        "w-5 h-5 rounded-full hover:scale-110 transition-transform flex items-center justify-center",
                                        color,
                                        program.color === color && "ring-2 ring-blue-400 ring-offset-1"
                                    )}
                                >
                                    {program.color === color && <Check className="w-3 h-3 text-white" />}
                                </button>
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                {program.description || "No description provided."}
            </p>

            <div className="mt-auto space-y-3">
                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{program.deadline ? format(new Date(program.deadline), "MMM d") : "No deadline"}</span>
                    </div>
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold border",
                        program.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            program.status === 'Planning' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-gray-50 text-gray-600 border-gray-100"
                    )}>
                        {program.status}
                    </span>
                </div>

                {/* Team Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex -space-x-1.5 hover:space-x-0 transition-all">
                        {(program.departments || []).slice(0, 3).map((dept, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white text-gray-600 flex items-center justify-center text-[9px] font-bold uppercase" title={dept}>
                                {dept.substring(0, 1)}
                            </div>
                        ))}
                        {(program.departments || []).length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white text-gray-400 flex items-center justify-center text-[9px] font-bold">
                                +{(program.departments || []).length - 3}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Manager</p>
                            <p className="text-xs font-medium text-gray-700">{program.projectManager || "Unassigned"}</p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                            {(program.projectManager || "?")[0]}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

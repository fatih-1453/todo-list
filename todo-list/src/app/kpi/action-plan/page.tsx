"use client"

import * as React from "react"
import { Search, Download, Upload, Plus, RefreshCcw, FileSpreadsheet, File, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { UploadActionPlanModal } from "@/components/action-plan/UploadActionPlanModal"
import { CreateActionPlanModal } from "@/components/action-plan/CreateActionPlanModal"
import * as XLSX from 'xlsx'
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth, format, isSameDay } from "date-fns"
import { ActionPlan } from "@/types/action-plan"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ActionPlanPage() {
    const queryClient = useQueryClient()
    const [isUploadOpen, setIsUploadOpen] = React.useState(false)
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [editingPlan, setEditingPlan] = React.useState<ActionPlan | null>(null)
    const [search, setSearch] = React.useState("")

    // Date Filter State
    const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString())
    const [selectedMonth, setSelectedMonth] = React.useState<string>((new Date().getMonth() + 1).toString())
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

    const [selectedIds, setSelectedIds] = React.useState<number[]>([])

    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState<number | 'all'>(50)

    // Sync Dropdowns to DateRange
    React.useEffect(() => {
        if (selectedYear && selectedMonth && selectedYear !== 'all' && selectedMonth !== 'all') {
            const year = parseInt(selectedYear)
            const month = parseInt(selectedMonth) - 1
            setDateRange({
                from: startOfMonth(new Date(year, month)),
                to: endOfMonth(new Date(year, month)),
            })
        } else if (selectedYear === 'all' || selectedMonth === 'all') {
            setDateRange(undefined)
        }
        setCurrentPage(1) // Reset page on filter change
    }, [selectedYear, selectedMonth])

    // Fetch Plans
    const { data: plans, isLoading } = useQuery({
        queryKey: ['actionPlans'],
        queryFn: () => apiClient.get<ActionPlan[]>('/action-plans'),
    })

    // Filter & Sort Logic
    const sortedAndFilteredPlans = React.useMemo(() => {
        if (!plans) return []

        let result = plans.filter((p) => {
            const matchesSearch = !search ||
                (p.lead?.toLowerCase().includes(search.toLowerCase()) ||
                    p.pic?.toLowerCase().includes(search.toLowerCase()) ||
                    p.program?.toLowerCase().includes(search.toLowerCase()))

            let matchesDate = true
            if (dateRange?.from && p.startDate) {
                const start = new Date(dateRange.from)
                start.setHours(0, 0, 0, 0)
                const planDate = new Date(p.startDate)
                if (dateRange.to) {
                    const end = new Date(dateRange.to)
                    end.setHours(23, 59, 59, 999)
                    matchesDate = planDate >= start && planDate <= end
                } else {
                    matchesDate = planDate >= start
                }
            }
            return matchesSearch && matchesDate
        })

        // Sort: Priority to "Today" (closest date to today)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        result.sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate) : new Date(0)
            const dateB = b.startDate ? new Date(b.startDate) : new Date(0)

            // Distance in milliseconds
            const distA = Math.abs(dateA.getTime() - today.getTime())
            const distB = Math.abs(dateB.getTime() - today.getTime())

            return distA - distB
        })

        return result
    }, [plans, search, dateRange])

    // Pagination Logic
    const paginatedPlans = React.useMemo(() => {
        if (pageSize === 'all') return sortedAndFilteredPlans
        const start = (currentPage - 1) * pageSize
        return sortedAndFilteredPlans.slice(start, start + pageSize)
    }, [sortedAndFilteredPlans, currentPage, pageSize])

    const totalPages = pageSize === 'all' ? 1 : Math.ceil(sortedAndFilteredPlans.length / pageSize)

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.length === sortedAndFilteredPlans.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(sortedAndFilteredPlans.map(p => p.id))
        }
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiClient.delete(`/action-plans/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
            toast.success("Plan deleted successfully")
        }
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) => apiClient.post('/action-plans/delete-bulk', { ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
            setSelectedIds([])
            toast.success("Plans deleted successfully")
        }
    })

    // Excel Export
    const handleDownloadData = () => {
        if (!plans || plans.length === 0) return
        const headers = [
            "No", "Nama", "Lead", "Program", "Catatan", "Indikator", "Lokasi",
            "Start Date", "End Date", "Target Kegiatan", "Realisasi Kegiatan",
            "Status", "Target Penerima", "Tujuan", "Jabatan", "Subdivisi",
            "Divisi", "Div Pelaksana", "Klasifikasi"
        ]
        const rows = sortedAndFilteredPlans.map((p, i) => [
            i + 1, p.pic, p.lead, p.program, p.notes, p.indikator, p.lokasi,
            p.startDate ? format(new Date(p.startDate), 'yyyy-MM-dd') : '',
            p.endDate ? format(new Date(p.endDate), 'yyyy-MM-dd') : '',
            p.targetActivity, p.realActivity, p.status, p.targetReceiver,
            p.goal, p.position, p.subdivisi, p.divisi, p.executingAgency, p.classification
        ])

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Action Plans")
        XLSX.writeFile(wb, "ActionPlans_Export.xlsx")
    }

    const handleDownloadTemplate = () => {
        const headers = [
            "Nama", "Lead", "Program", "Catatan", "Indikator", "Lokasi",
            "Start Date (YYYY-MM-DD)", "End Date (YYYY-MM-DD)", "Target Kegiatan", "Realisasi Kegiatan", "Status",
            "Target Penerima", "Tujuan", "Jabatan", "Subdivisi", "Divisi",
            "Div Pelaksana", "Klasifikasi"
        ]
        const ws = XLSX.utils.aoa_to_sheet([headers])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Template")
        XLSX.writeFile(wb, "ActionPlan_Template.xlsx")
    }

    // Generator
    const generateSampleMutation = useMutation({
        mutationFn: () => {
            const samples = [
                {
                    pic: "Mochammad Sukamto",
                    lead: "Seleksi Rekrutmen",
                    program: "Program Rekrutmen Karyawan Baru",
                    notes: "Melakukan proses seleksi administratif & wawancara",
                    indikator: "Terpenuhinya kebutuhan",
                    lokasi: "Kantor Sawangan",
                    startDate: new Date().toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
                    targetActivity: 4,
                    realActivity: 4,
                    status: "Done",
                    targetReceiver: "Operasional",
                    goal: "MANAJER",
                    position: "HRD",
                    subdivisi: "HRD",
                    divisi: "HRD",
                    executingAgency: "Ramadhan",
                    classification: "General"
                }
            ]
            return apiClient.post('/action-plans/bulk', samples)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
    })


    // Update Mutation
    const updatePlanMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<ActionPlan> }) =>
            apiClient.put(`/action-plans/${id}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
    })

    const handleUpdateStatus = (id: number, status: string) => {
        updatePlanMutation.mutate({ id, data: { status: status } })
    }

    const handleUpdateRealActivity = (id: number, value: string) => {
        const num = parseInt(value)
        if (!isNaN(num)) {
            updatePlanMutation.mutate({ id, data: { realActivity: num } })
        }
    }

    const handleUpdate = (plan: ActionPlan) => {
        setEditingPlan(plan)
        setIsCreateOpen(true)
    }

    // Check if date is today
    const isToday = (dateStr?: string | Date) => {
        if (!dateStr) return false
        return isSameDay(new Date(dateStr), new Date())
    }

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-800">Action Plan</h1>
                    {selectedIds.length > 0 && (
                        <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {selectedIds.length} selected
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm(`Delete ${selectedIds.length} items?`)) {
                                    bulkDeleteMutation.mutate(selectedIds)
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100 transition border border-red-200"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                        </button>
                    )}
                    <div className="h-6 w-px bg-gray-300 mx-1" />
                    <button onClick={() => { setEditingPlan(null); setIsCreateOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition">
                        <Plus className="w-3.5 h-3.5" /> New Plan
                    </button>
                    <div className="h-6 w-px bg-gray-300 mx-1" />
                    <button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition">
                        <Upload className="w-3.5 h-3.5" /> Import
                    </button>
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition">
                        <File className="w-3.5 h-3.5" /> Template
                    </button>
                    <button onClick={handleDownloadData} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition">
                        <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button onClick={() => generateSampleMutation.mutate()} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition">
                        <RefreshCcw className="w-3.5 h-3.5" /> Sample Data
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center gap-3">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="h-6 w-px bg-gray-200" />

                {/* Month/Year Filters */}
                <div className="flex items-center gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={(i + 1).toString()}>
                                    {format(new Date(0, i), 'MMMM')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[80px] h-8 text-xs">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="h-6 w-px bg-gray-200" />
                <DatePickerWithRange date={dateRange} setDate={setDateRange} className="h-8 text-xs" />
            </div>

            {/* Spreadsheet Table */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="min-w-max w-full border-collapse text-xs">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-3 py-2 border-b border-r border-gray-200 w-10 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={sortedAndFilteredPlans.length > 0 && selectedIds.length === sortedAndFilteredPlans.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-3 py-2 border-b border-r border-gray-200 w-20 text-center font-semibold text-gray-600 uppercase">Actions</th>
                            {[
                                "No", "NAMA", "LEAD", "PROGRAM", "CATATAN",
                                "Indikator", "LOKASI", "Start Date", "End Date",
                                "TARGET KEGIATAN", "Realisasi Kegiatan", "Status",
                                "TARGET PENERIMA", "TUJUAN", "JABATAN", "SUBDIVISI",
                                "DIVISI", "DIV PELAKSANA", "KLASIFIKASI PELAKSANAAN"
                            ].map((h, i) => (
                                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-r border-gray-200 uppercase tracking-wide whitespace-nowrap bg-gray-50">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={21} className="p-10 text-center text-gray-500">Loading data...</td></tr>
                        ) : paginatedPlans.length === 0 ? (
                            <tr><td colSpan={21} className="p-10 text-center text-gray-500">No action plans found.</td></tr>
                        ) : (
                            paginatedPlans.map((p, idx) => {
                                const isRowToday = isToday(p.startDate)
                                const globalIndex = pageSize === 'all' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1
                                return (
                                    <tr key={p.id} className={`hover:bg-blue-50/50 group transition-colors ${selectedIds.includes(p.id) ? 'bg-blue-50' : isRowToday ? 'bg-yellow-100/60 border-l-4 border-l-yellow-500' : ''}`}>
                                        <td className="px-3 py-2 text-center border-r border-gray-100">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                            />
                                        </td>
                                        <td className="px-2 py-2 border-r border-gray-100">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleUpdate(p)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this plan?')) deleteMutation.mutate(p.id)
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-500 border-r border-gray-100">{globalIndex}</td>
                                        <td className="px-3 py-2 font-medium text-gray-900 border-r border-gray-100 whitespace-nowrap">{p.pic}</td>
                                        <td className="px-3 py-2 text-gray-800 border-r border-gray-100 font-medium whitespace-nowrap">{p.lead}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-xs truncate" title={p.program}>{p.program}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-xs truncate" title={p.notes}>{p.notes}</td>

                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 truncate">{p.indikator}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100">{p.lokasi}</td>
                                        <td className={`px-3 py-2 border-r border-gray-100 w-24 whitespace-nowrap ${isRowToday ? 'font-bold text-yellow-800' : 'text-gray-600'}`}>
                                            {p.startDate ? format(new Date(p.startDate), 'MMM dd, yyyy') : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 w-24 whitespace-nowrap">
                                            {p.endDate ? format(new Date(p.endDate), 'MMM dd, yyyy') : '-'}
                                        </td>

                                        <td className="px-3 py-2 text-center font-semibold text-indigo-600 border-r border-gray-100">{p.targetActivity}</td>

                                        {/* Realisasi Kegiatan (Editable) */}
                                        <td className="px-0 py-0 text-center text-gray-700 border-r border-gray-100">
                                            <input
                                                type="number"
                                                className="w-full h-full px-2 py-2 bg-transparent text-center focus:outline-none focus:bg-indigo-50 transition-colors"
                                                defaultValue={p.realActivity || 0}
                                                onBlur={(e) => handleUpdateRealActivity(p.id, e.target.value)}
                                            />
                                        </td>

                                        {/* Status (Dropdown) */}
                                        <td className="px-0 py-0 border-r border-gray-100 bg-transparent">
                                            <select
                                                className={`w-full h-full px-2 py-2 text-[10px] font-medium uppercase bg-transparent focus:outline-none cursor-pointer ${p.status?.toLowerCase() === 'done' ? 'text-emerald-700' :
                                                    p.status?.toLowerCase() === 'on progres' ? 'text-amber-700' :
                                                        p.status?.toLowerCase() === 'cancel' ? 'text-red-700' :
                                                            'text-gray-500'
                                                    }`}
                                                value={p.status || 'Pending'}
                                                onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Cancel">Cancel</option>
                                                <option value="Progres">Progres</option>
                                                <option value="On Progres">On Progres</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        </td>

                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.targetReceiver}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 uppercase text-[10px] font-semibold">{p.goal}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.position}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.subdivisi}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.divisi}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.executingAgency}</td>
                                        <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.classification}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">Rows per page:</span>
                    <Select value={pageSize.toString()} onValueChange={(v) => {
                        setPageSize(v === 'all' ? 'all' : Number(v))
                        setCurrentPage(1)
                    }}>
                        <SelectTrigger className="w-[70px] h-7 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-gray-500 ml-2">
                        Total {sortedAndFilteredPlans.length} items
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-gray-600 mr-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <UploadActionPlanModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
            <CreateActionPlanModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                initialData={editingPlan}
            />
        </div>
    )
}

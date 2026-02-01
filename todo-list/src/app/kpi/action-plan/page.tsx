"use client"

import * as React from "react"
import { Search, Download, Upload, Plus, RefreshCcw, FileSpreadsheet, File, Trash2, Edit, ChevronLeft, ChevronRight, TrendingUp, PieChart, Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react"
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
    // New Filter States
    const [selectedDivisi, setSelectedDivisi] = React.useState<string>("all")
    const [selectedPic, setSelectedPic] = React.useState<string>("all")
    const [selectedProgram, setSelectedProgram] = React.useState<string>("all")



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

    // Extract Unique Filter Values
    const uniqueFilters = React.useMemo(() => {
        // Return empty arrays if plans is undefined
        if (!plans) return { divisi: [], pic: [], program: [] }

        const divisi = Array.from(new Set(plans.map(p => p.divisi).filter(Boolean))) as string[]
        const pic = Array.from(new Set(plans.map(p => p.pic).filter(Boolean))) as string[]
        const program = Array.from(new Set(plans.map(p => p.program).filter(Boolean))) as string[]

        return {
            divisi: divisi.sort(),
            pic: pic.sort(),
            program: program.sort()
        }
    }, [plans])

    // Filter & Sort Logic
    const sortedAndFilteredPlans = React.useMemo(() => {
        if (!plans) return []

        let result = plans.filter((p) => {
            // Updated Filter Logic: Strict Match for Dropdowns
            const matchesDivisi = selectedDivisi === "all" || p.divisi === selectedDivisi
            const matchesPic = selectedPic === "all" || p.pic === selectedPic
            const matchesProgram = selectedProgram === "all" || p.program === selectedProgram

            // Generic Search (still useful for other fields like Lead or specific text in notes)
            const matchesSearch = !search ||
                (p.lead?.toLowerCase().includes(search.toLowerCase()) ||
                    p.output?.toLowerCase().includes(search.toLowerCase()))

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
            return matchesDivisi && matchesPic && matchesProgram && matchesSearch && matchesDate
        })

        // Sort Logic: Stable & Predictable
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        result.sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate) : new Date(0)
            const dateB = b.startDate ? new Date(b.startDate) : new Date(0)

            // 1. Critical Priority: Start Date == Today
            const isTodayA = isSameDay(dateA, today)
            const isTodayB = isSameDay(dateB, today)

            if (isTodayA && !isTodayB) return -1
            if (!isTodayA && isTodayB) return 1

            // 2. Date Proximity (Closed date to today = higher)
            // We use absolute difference to group "nearby" tasks together
            const distA = Math.abs(dateA.getTime() - today.getTime())
            const distB = Math.abs(dateB.getTime() - today.getTime())

            if (Math.abs(distA - distB) > 1000) { // Tolerance for tiny diffs
                return distA - distB
            }

            // 3. Absolute Stability Fallback (ID)
            // This ensures that even if you edit a row, it NEVER jumps
            // unless the date actually changes.
            return (a.id || 0) - (b.id || 0)
        })

        return result
    }, [plans, search, dateRange, selectedDivisi, selectedPic, selectedProgram])

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
            i + 1, p.pic, p.lead, p.program, p.output, p.indikator, p.lokasi,
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
                    output: "Melakukan proses seleksi administratif & wawancara",
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

    // Metrics Calculation
    const dashboardMetrics = React.useMemo(() => {
        const total = sortedAndFilteredPlans.length
        if (total === 0) return { total: 0, progress: 0, done: 0, onProgress: 0, pending: 0 }

        let totalProgress = 0
        let done = 0
        let onProgress = 0
        let pending = 0

        sortedAndFilteredPlans.forEach(p => {
            const t = p.targetActivity || 1 // avoid div by zero
            const r = p.realActivity || 0
            const pct = Math.min(100, Math.round((r / t) * 100))
            totalProgress += pct

            const status = p.status?.toLowerCase() || ''
            if (status === 'done') done++
            else if (status.includes('progres') || status === 'on progres') onProgress++
            else if (status !== 'cancel') pending++ // Assume everything else not cancel is pending
        })

        // Adjust counting if needed, but basic logic is fine
        return {
            total,
            progress: Math.round(totalProgress / total),
            done,
            onProgress,
            pending
        }
    }, [sortedAndFilteredPlans])

    // Helper for Status Color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'done': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'on progres': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'progres': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'cancel': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50/50 overflow-hidden font-sans">
            {/* Smart Dashboard Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 pb-2">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Plans</p>
                        <h3 className="text-2xl font-bold text-gray-800">{dashboardMetrics.total}</h3>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg Completion</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-gray-800">{dashboardMetrics.progress}%</h3>
                            <span className="text-xs text-emerald-600 mb-1 font-medium">on track</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${dashboardMetrics.progress}%` }} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active</p>
                        <h3 className="text-2xl font-bold text-gray-800">{dashboardMetrics.onProgress}</h3>
                        <p className="text-[10px] text-gray-400">On Progress</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Done</p>
                            <h3 className="text-xl font-bold text-gray-800">{dashboardMetrics.done}</h3>
                        </div>
                        <div className="h-full w-px bg-gray-100" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</p>
                            <h3 className="text-xl font-bold text-gray-800">{dashboardMetrics.pending}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar & Filter - Stacked in a nice card */}
            <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

                    {/* Filter Group: Modern Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">

                        {/* Division Dropdown */}
                        <div className="relative min-w-[160px]">
                            <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
                                <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-full text-xs font-medium focus:ring-indigo-500 transition-all hover:bg-gray-50 hover:border-indigo-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Divisi:</span>
                                        <SelectValue placeholder="All" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Divisions</SelectItem>
                                    {uniqueFilters.divisi.length > 0 && <div className="h-px bg-gray-100 my-1" />}
                                    {uniqueFilters.divisi.map((div, i) => (
                                        <SelectItem key={i} value={div}>{div}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Name (PIC) Dropdown */}
                        <div className="relative min-w-[160px]">
                            <Select value={selectedPic} onValueChange={setSelectedPic}>
                                <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-full text-xs font-medium focus:ring-indigo-500 transition-all hover:bg-gray-50 hover:border-indigo-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Name:</span>
                                        <SelectValue placeholder="All" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="all">All Names</SelectItem>
                                    {uniqueFilters.pic.length > 0 && <div className="h-px bg-gray-100 my-1" />}
                                    {uniqueFilters.pic.map((p, i) => (
                                        <SelectItem key={i} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Program Dropdown */}
                        <div className="relative min-w-[160px]">
                            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                <SelectTrigger className="h-10 bg-white border border-gray-200 rounded-full text-xs font-medium focus:ring-indigo-500 transition-all hover:bg-gray-50 hover:border-indigo-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Prog:</span>
                                        <SelectValue placeholder="All" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {uniqueFilters.program.length > 0 && <div className="h-px bg-gray-100 my-1" />}
                                    {uniqueFilters.program.map((p, i) => (
                                        <SelectItem key={i} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Bar - Retained for generic search */}
                        <div className="relative w-full md:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search other..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 h-10 text-xs bg-white border border-gray-200 rounded-full focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none shadow-sm"
                            />
                        </div>

                        {/* Clear Filters Button */}
                        {(selectedDivisi !== 'all' || selectedPic !== 'all' || selectedProgram !== 'all' || search) && (
                            <button
                                onClick={() => { setSelectedDivisi('all'); setSelectedPic('all'); setSelectedProgram('all'); setSearch(''); }}
                                className="px-3 py-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Reset
                            </button>
                        )}
                    </div>

                    {/* Right Side: Date Actions & Grid Controls */}
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[110px] h-9 border-none bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg text-xs font-medium">
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
                            <SelectTrigger className="w-[80px] h-9 border-none bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg text-xs font-medium">
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

                        <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

                        {selectedIds.length > 0 ? (
                            <button
                                onClick={() => {
                                    if (confirm(`Delete ${selectedIds.length} items?`)) {
                                        bulkDeleteMutation.mutate(selectedIds)
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors animate-in fade-in"
                            >
                                <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={handleDownloadData} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Export Excel">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button onClick={() => setIsUploadOpen(true)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Import Excel">
                                    <Upload className="w-5 h-5" />
                                </button>
                                <button onClick={() => { setEditingPlan(null); setIsCreateOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                                    <Plus className="w-4 h-4" /> New Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-auto mx-4 mb-4 bg-white rounded-xl border border-gray-200 shadow-sm relative">
                <table className="min-w-max w-full border-collapse text-xs">
                    <thead className="sticky top-0 z-20 backdrop-blur-md bg-white/90 shadow-sm supports-[backdrop-filter]:bg-white/60">
                        <tr>
                            <th className="px-4 py-3 border-b border-gray-100 text-left w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    checked={sortedAndFilteredPlans.length > 0 && selectedIds.length === sortedAndFilteredPlans.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-3 border-b border-gray-100 text-left w-20 font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            {[
                                "No", "Nama", "Program", "Output", "Start Date", "End Date",
                                "Progress", "Status",
                                "Target", "Real", "Indikator", "Lokasi", "Target Penerima", "Divisi"
                            ].map((h, i) => (
                                <th key={i} className="px-4 py-3 text-left font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr><td colSpan={20} className="p-20 text-center text-gray-400">Loading data...</td></tr>
                        ) : paginatedPlans.length === 0 ? (
                            <tr><td colSpan={20} className="p-20 text-center text-gray-400 flex flex-col items-center gap-4">
                                <div className="bg-gray-50 p-4 rounded-full"><FileSpreadsheet className="w-8 h-8 text-gray-300" /></div>
                                <p>No action plans found.</p>
                            </td></tr>
                        ) : (
                            paginatedPlans.map((p, idx) => {
                                const isRowToday = isToday(p.startDate)
                                const globalIndex = pageSize === 'all' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1
                                const percent = Math.min(100, Math.round(((p.realActivity || 0) / (p.targetActivity || 1)) * 100))

                                return (
                                    <tr key={p.id} className={`group transition-all hover:bg-gray-50 ${selectedIds.includes(p.id) ? 'bg-indigo-50/60' : isRowToday ? 'bg-yellow-100 shadow-md border-l-[6px] border-l-yellow-500' : 'bg-white'}`}>
                                        <td className="px-4 py-3 border-r border-transparent">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleUpdate(p)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(p.id) }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-500">{globalIndex}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{p.pic}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={p.program}>{p.program}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px] whitespace-normal break-words" title={p.output}>{p.output}</td>

                                        {/* Smart Dates */}
                                        <td className={`px-4 py-3 whitespace-nowrap ${isRowToday ? 'font-bold text-amber-900 bg-amber-200/50 rounded-md px-2' : 'text-gray-500'}`}>
                                            {p.startDate ? format(new Date(p.startDate), 'dd MMM yyyy') : '-'}
                                            {isRowToday && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] uppercase font-bold rounded-full animate-pulse">TODAY</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {p.endDate ? format(new Date(p.endDate), 'dd MMM yyyy') : '-'}
                                        </td>

                                        {/* Progress Bar */}
                                        <td className="px-4 py-3 min-w-[140px]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-semibold text-gray-700">{percent}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} />
                                            </div>
                                        </td>

                                        {/* Modern Status Badge */}
                                        <td className="px-4 py-3">
                                            <div className="relative">
                                                <select
                                                    className={`appearance-none pl-3 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 hover:brightness-95 transition-all ${getStatusColor(p.status || 'Pending')}`}
                                                    value={p.status || 'Pending'}
                                                    onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Cancel">Cancel</option>
                                                    <option value="Progres">Progres</option>
                                                    <option value="On Progres">On Progres</option>
                                                    <option value="Done">Done</option>
                                                </select>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center font-mono text-xs text-gray-600 bg-gray-50/50 rounded">{(p.targetActivity || 0).toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                className="w-16 px-2 py-1 bg-transparent border border-transparent hover:border-gray-200 focus:border-indigo-500 rounded text-center text-xs transition-colors focus:outline-none"
                                                defaultValue={p.realActivity || 0}
                                                onBlur={(e) => handleUpdateRealActivity(p.id, e.target.value)}
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]" title={p.indikator}>{p.indikator}</td>
                                        <td className="px-4 py-3 text-gray-500">{p.lokasi}</td>
                                        <td className="px-4 py-3 text-gray-500 truncate max-w-[100px]">{p.targetReceiver}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.divisi}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden flex-1 overflow-auto px-4 pb-20 space-y-4">
                {paginatedPlans.map((p) => {
                    const percent = Math.min(100, Math.round(((p.realActivity || 0) / (p.targetActivity || 1)) * 100))
                    return (
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                            {/* Header: Action & Status */}
                            <div className="flex justify-between items-start gap-3">
                                <h3 className="font-bold text-gray-900 text-sm leading-tight">{p.lead}</h3>
                                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide whitespace-nowrap ${getStatusColor(p.status || 'Pending')}`}>
                                    {p.status || 'Pending'}
                                </span>
                            </div>

                            {/* Sub-Header: PIC & Division */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md">{p.pic}</span>
                                <span>•</span>
                                <span className="text-indigo-600 font-medium">{p.divisi}</span>
                            </div>

                            {/* Dates */}
                            <div className="flex items-center gap-4 text-xs text-gray-400 bg-gray-50/50 p-2 rounded-lg">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-300">Start</span>
                                    <span className="font-medium text-gray-600">{p.startDate ? format(new Date(p.startDate), 'd MMM') : '-'}</span>
                                </div>
                                <div className="w-px h-6 bg-gray-200" />
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-300">Due</span>
                                    <span className="font-medium text-gray-600">{p.endDate ? format(new Date(p.endDate), 'd MMM') : '-'}</span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="font-semibold text-gray-500">Progress</span>
                                    <span className="font-bold text-indigo-600">{percent}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                                <button onClick={() => handleUpdate(p)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                                    <Edit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(p.id) }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Rows per page:</span>
                    <Select value={pageSize.toString()} onValueChange={(v) => {
                        setPageSize(v === 'all' ? 'all' : Number(v))
                        setCurrentPage(1)
                    }}>
                        <SelectTrigger className="w-[70px] h-8 text-xs bg-gray-50 border-gray-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 transition-colors border-r border-gray-200"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
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


"use client"

import * as React from "react"
import { Search, Download, Upload, Filter, Plus, Trash2, Loader2, RefreshCcw, Pencil, X, Calendar, ArrowUpDown, ChevronDown, FileSpreadsheet } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { UploadActionPlanModal } from "@/components/action-plan/UploadActionPlanModal"
import { CreateActionPlanModal } from "@/components/action-plan/CreateActionPlanModal"
import * as XLSX from 'xlsx'
import { StatusDropdown } from "@/components/action-plan/StatusDropdown"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth, isSameDay, compareAsc, format, isFuture, isPast } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export default function ActionPlanPage() {
    const queryClient = useQueryClient()
    const [isUploadOpen, setIsUploadOpen] = React.useState(false)
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [editingPlan, setEditingPlan] = React.useState<any>(null)
    const [search, setSearch] = React.useState("")
    const [selectedIds, setSelectedIds] = React.useState<number[]>([])
    const [showFilters, setShowFilters] = React.useState(false)

    // Date Range State (Default: Current Month)
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    })

    const [filters, setFilters] = React.useState({
        div: "",
        pic: "",
    })

    // Fetch Plans
    const { data: plans, isLoading } = useQuery({
        queryKey: ['actionPlans'],
        queryFn: () => apiClient.get('/action-plans').then((res: any) => res as any[]),
    })

    // Unique Filter Options
    const uniqueDivs = React.useMemo(() => {
        if (!plans) return []
        const divs = new Set(plans.map((p: any) => p.div).filter(Boolean))
        return Array.from(divs).sort()
    }, [plans])

    const uniquePics = React.useMemo(() => {
        if (!plans) return []
        const pics = new Set(plans.map((p: any) => p.pic).filter(Boolean))
        return Array.from(pics).sort()
    }, [plans])

    // Smart Filter & Sort Logic
    const filteredPlans = React.useMemo(() => {
        if (!plans) return []

        let result = plans.filter((p: any) => {
            // Search Filter
            if (search) {
                const lowerSearch = search.toLowerCase()
                const matchesSearch = (p.plan || "").toLowerCase().includes(lowerSearch) ||
                    (p.pic || "").toLowerCase().includes(lowerSearch) ||
                    (p.department || "").toLowerCase().includes(lowerSearch) ||
                    (p.div || "").toLowerCase().includes(lowerSearch)

                if (!matchesSearch) return false
            }

            // Dropdown Filters
            if (filters.div && p.div !== filters.div) return false
            if (filters.pic && p.pic !== filters.pic) return false

            // Date Range Filter
            if (dateRange?.from) {
                if (!p.startDate) return false
                const d = new Date(p.startDate)
                d.setHours(0, 0, 0, 0) // normalize

                const from = new Date(dateRange.from)
                from.setHours(0, 0, 0, 0)

                if (dateRange.to) {
                    const to = new Date(dateRange.to)
                    to.setHours(23, 59, 59, 999)
                    return d >= from && d <= to
                }
                return d >= from
            }

            return true
        })

        // Smart Sort: Today -> Upcoming -> Past
        return result.sort((a: any, b: any) => {
            const dateA = a.startDate ? new Date(a.startDate) : new Date(9999, 11, 31)
            const dateB = b.startDate ? new Date(b.startDate) : new Date(9999, 11, 31)
            const today = new Date()

            const isTodayA = isSameDay(dateA, today)
            const isTodayB = isSameDay(dateB, today)

            if (isTodayA && !isTodayB) return -1
            if (!isTodayA && isTodayB) return 1

            return compareAsc(dateA, dateB)
        })
    }, [plans, search, filters, dateRange])

    const totalPlans = plans?.length || 0

    const achievementRate = React.useMemo(() => {
        if (!totalPlans || !plans) return 0
        const completed = plans.filter((p: any) => p.realWeek1 && p.realWeek1.toLowerCase().includes('done')).length
        return Math.floor((completed / totalPlans) * 100)
    }, [plans, totalPlans])

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredPlans.map((p: any) => p.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const startEdit = (plan: any) => {
        setEditingPlan(plan)
        setIsCreateOpen(true)
    }

    const closeCreateModal = () => {
        setIsCreateOpen(false)
        setEditingPlan(null)
    }

    // Mutations
    const updatePlanMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => apiClient.put(`/action-plans/${id}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
    })

    const deleteMutation = useMutation({
        mutationFn: () => apiClient.delete('/action-plans/all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
            setSelectedIds([])
        }
    })

    const deleteOneMutation = useMutation({
        mutationFn: (id: number) => apiClient.delete(`/action-plans/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) => apiClient.post('/action-plans/delete-bulk', { ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
            setSelectedIds([])
        }
    })

    const generateSampleMutation = useMutation({
        mutationFn: () => {
            const today = new Date();
            const samples = [
                {
                    div: "Commercial",
                    wig: "Increase Revenue by 20%",
                    lag: "Monthly Sales Report",
                    lead: "Visit 5 Clients / Week",
                    plan: "Priority Client Visit (Today)",
                    department: "Sales",
                    pic: "Ahmad",
                    startDate: today.toISOString(),
                    targetActivity: 5,
                    targetNominal: 50000000,
                    realNominal: 0,
                    risk: "Traffic", notes: "Must visit Top 5",
                },
                {
                    div: "Marketing",
                    wig: "Brand Awareness",
                    lag: "Social Media Reach",
                    lead: "Post 3x / Day",
                    plan: "Content Creation (Tomorrow)",
                    department: "Creative",
                    pic: "Sarah",
                    startDate: new Date(today.getTime() + 86400000).toISOString(),
                    targetActivity: 3,
                    targetNominal: 0,
                    notes: "Prepare for weekend",
                }
            ];
            return apiClient.post('/action-plans/bulk', samples)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
    })

    const handleDownloadData = () => {
        if (!plans || plans.length === 0) { alert("No data"); return; }
        const headers = [["ACTION PLAN 2026"], ["DIV", "Plan", "Date", "Status"]];
        const rows = plans.map((p: any) => [p.div, p.plan, p.startDate, p.realWeek1]);
        const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "ActionPlan_Data.xlsx");
    };

    const handleDownloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([["Template"]]);
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template.xlsx");
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        Smart Action Plan
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage, Track, and Execute your strategic initiatives.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {selectedIds.length > 0 ? (
                        <button
                            onClick={() => {
                                if (confirm(`Delete ${selectedIds.length} selected items?`)) {
                                    bulkDeleteMutation.mutate(selectedIds)
                                }
                            }}
                            className="btn-danger text-xs flex items-center gap-2"
                            disabled={bulkDeleteMutation.isPending}
                        >
                            <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
                        </button>
                    ) : (
                        <button onClick={() => generateSampleMutation.mutate()} className="btn-secondary text-xs flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600">
                            <RefreshCcw className="w-3 h-3" /> Sample Data
                        </button>
                    )}

                    <button onClick={() => setIsUploadOpen(true)} className="btn-secondary text-xs flex items-center gap-2">
                        <Upload className="w-3 h-3" /> Import
                    </button>
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-indigo-200">
                        <Plus className="w-3 h-3 mr-2" /> New Plan
                    </button>
                </div>
            </div>

            {/* Smart Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-indigo-50 shadow-sm hover:shadow-md transition-all">
                    <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">Total Plans</div>
                    <div className="text-3xl font-bold text-gray-900">{totalPlans}</div>
                    <div className="text-xs text-gray-400 mt-1">Active items</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-green-50 shadow-sm hover:shadow-md transition-all">
                    <div className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">Completion Rate</div>
                    <div className="text-3xl font-bold text-green-700">{achievementRate}%</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${achievementRate}% ` }}></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-orange-50 shadow-sm hover:shadow-md transition-all">
                    <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">Pending Items</div>
                    <div className="text-3xl font-bold text-orange-600">
                        {filteredPlans?.filter((p: any) => !p.realWeek1 || !p.realWeek1.includes('Done')).length}
                    </div>
                    <div className="text-xs text-orange-400 mt-1">Requires attention</div>
                </div>

                {/* Replaced Quick Actions with Download/Exports */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Download className="w-3 h-3" /> Downloads
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button onClick={handleDownloadData} className="flex flex-col items-center justify-center p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors border border-green-100">
                            <FileSpreadsheet className="w-5 h-5 mb-1" />
                            Data
                        </button>
                        <button onClick={handleDownloadTemplate} className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors border border-gray-100">
                            <FileSpreadsheet className="w-5 h-5 mb-1" />
                            Template
                        </button>
                    </div>
                </div>
            </div>

            {/* Smart Toolbar */}
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center sticky top-4 z-20">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search plans, PIC, or context..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent border-0 py-2 pl-10 pr-4 text-sm focus:ring-0 font-medium placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <DatePickerWithRange
                            date={dateRange}
                            setDate={setDateRange}
                            className="border-0 bg-transparent shadow-none hover:bg-white text-gray-600 text-sm font-medium h-8"
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                    <select
                        value={filters.div}
                        onChange={(e) => setFilters(prev => ({ ...prev, div: e.target.value }))}
                        className="h-9 px-3 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium min-w-[120px] text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <option value="">All Divisions</option>
                        {uniqueDivs.map((div: any) => <option key={div} value={div}>{div}</option>)}
                    </select>

                    <select
                        value={filters.pic}
                        onChange={(e) => setFilters(prev => ({ ...prev, pic: e.target.value }))}
                        className="h-9 px-3 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium min-w-[100px] text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <option value="">All PICs</option>
                        {uniquePics.map((pic: any) => <option key={pic} value={pic}>{pic}</option>)}
                    </select>
                </div>
            </div>

            {/* Modern Data Table */}
            <div className="bg-white border boundary-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 w-10 text-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={filteredPlans?.length > 0 && selectedIds.length === filteredPlans?.length}
                                        onChange={handleSelectAll} />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[30%]">Plan Description</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PIC / Div</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Targets</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Realization</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {!isLoading && filteredPlans?.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 bg-gray-50/30">
                                        <div className="flex flex-col items-center">
                                            <Calendar className="w-10 h-10 mb-3 text-gray-300" />
                                            <p className="font-medium">No plans found for this period</p>
                                            <p className="text-sm mt-1">Try adjusting the filters or adding a new plan</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {filteredPlans && filteredPlans.map((plan: any) => {
                                const isToday = plan.startDate && isSameDay(new Date(plan.startDate), new Date());
                                return (
                                    <tr key={plan.id} className={`group transition - all hover: bg - indigo - 50 / 30 ${selectedIds.includes(plan.id) ? 'bg-indigo-50/50' : ''} ${isToday ? 'bg-amber-50/40' : ''} `}>
                                        <td className="px-6 py-4 text-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedIds.includes(plan.id)}
                                                onChange={() => handleSelectOne(plan.id)} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`flex flex - col ${isToday ? 'text-amber-700 font-bold' : 'text-gray-600'} `}>
                                                <span className="text-sm">
                                                    {plan.startDate ? format(new Date(plan.startDate), 'MMM dd, yyyy') : '-'}
                                                </span>
                                                {isToday && <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded w-fit mt-1">Today</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                {plan.plan}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 truncate max-w-[300px]">{plan.notes}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {plan.pic?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{plan.pic}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 ml-8">{plan.div}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500">Activity: <span className="font-semibold text-gray-900">{plan.targetActivity}</span></div>
                                            {Number(plan.targetNominal) > 0 && (
                                                <div className="text-xs text-gray-500 mt-0.5">Val: <span className="font-semibold text-gray-900">{new Intl.NumberFormat('id-ID', { compactDisplay: 'short', notation: 'compact' }).format(Number(plan.targetNominal))}</span></div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                defaultValue={Number(plan.realNominal || 0)}
                                                className="w-24 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 text-sm font-medium p-0"
                                                placeholder="0"
                                                onBlur={(e) => {
                                                    if (e.target.value !== String(plan.realNominal)) {
                                                        updatePlanMutation.mutate({ id: plan.id, data: { realNominal: e.target.value } })
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusDropdown
                                                value={plan.realWeek1 as string}
                                                onChange={(newStatus) => updatePlanMutation.mutate({
                                                    id: plan.id,
                                                    data: { realWeek1: newStatus }
                                                })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(plan)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { if (confirm("Delete item?")) deleteOneMutation.mutate(plan.id) }} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <UploadActionPlanModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
            <CreateActionPlanModal
                isOpen={isCreateOpen}
                onClose={closeCreateModal}
                initialData={editingPlan}
            />
        </div>
    )
}

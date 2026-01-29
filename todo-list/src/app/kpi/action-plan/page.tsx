"use client"

import * as React from "react"
import { Search, Download, Upload, Plus, RefreshCcw, FileSpreadsheet, File } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { UploadActionPlanModal } from "@/components/action-plan/UploadActionPlanModal"
import { CreateActionPlanModal } from "@/components/action-plan/CreateActionPlanModal"
import * as XLSX from 'xlsx'
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth, format, isSameDay } from "date-fns"
import { ActionPlan } from "@/types/action-plan"

export default function ActionPlanPage() {
    const queryClient = useQueryClient()
    const [isUploadOpen, setIsUploadOpen] = React.useState(false)
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [editingPlan, setEditingPlan] = React.useState<ActionPlan | null>(null)
    const [search, setSearch] = React.useState("")
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    })

    // Fetch Plans
    const { data: plans, isLoading } = useQuery({
        queryKey: ['actionPlans'],
        queryFn: () => apiClient.get<ActionPlan[]>('/action-plans'),
    })

    // Filter Logic
    const filteredPlans = React.useMemo(() => {
        if (!plans) return []
        return plans.filter((p) => {
            const matchesSearch = !search ||
                (p.plan?.toLowerCase().includes(search.toLowerCase()) ||
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
    }, [plans, search, dateRange])

    // Excel Export
    const handleDownloadData = () => {
        if (!plans || plans.length === 0) return
        const headers = [
            "No", "Nama", "Lead", "Program", "Catatan", "Indikator", "Lokasi",
            "Start Date", "End Date", "Target Kegiatan", "Realisasi Kegiatan",
            "Status", "Target Penerima", "Tujuan", "Jabatan", "Subdivisi",
            "Divisi", "Div Pelaksana", "Klasifikasi"
        ]
        const rows = filteredPlans.map((p, i) => [
            i + 1, p.pic, p.plan, p.program, p.notes, p.indikator, p.lokasi,
            p.startDate ? format(new Date(p.startDate), 'yyyy-MM-dd') : '',
            p.endDate ? format(new Date(p.endDate), 'yyyy-MM-dd') : '',
            p.targetActivity, p.realActivity, p.realWeek1, p.targetReceiver,
            p.goal, p.position, p.subdivisi, p.div, p.executingAgency, p.classification
        ])

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Action Plans")
        XLSX.writeFile(wb, "ActionPlans_Export.xlsx")
    }

    const handleDownloadTemplate = () => {
        const headers = [
            "Nama", "Plan (Lead)", "Program", "Catatan", "Indikator", "Lokasi",
            "Start Date (YYYY-MM-DD)", "End Date (YYYY-MM-DD)", "Target Kegiatan",
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
                    plan: "Seleksi Rekrutmen",
                    program: "Program Rekrutmen Karyawan Baru",
                    notes: "Melakukan proses seleksi administratif & wawancara",
                    indikator: "Terpenuhinya kebutuhan",
                    lokasi: "Kantor Sawangan",
                    startDate: new Date().toISOString(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
                    targetActivity: 4,
                    realActivity: 4,
                    realWeek1: "Done",
                    targetReceiver: "Operasional",
                    goal: "MANAJER",
                    position: "HRD",
                    subdivisi: "HRD",
                    div: "HRD",
                    executingAgency: "Ramadhan",
                    classification: "General"
                }
            ]
            return apiClient.post('/action-plans/bulk', samples)
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
    })

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-800">Action Plan</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition">
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
                <DatePickerWithRange date={dateRange} setDate={setDateRange} className="h-8 text-xs" />
            </div>

            {/* Spreadsheet Table */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="min-w-max w-full border-collapse text-xs">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
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
                            <tr><td colSpan={19} className="p-10 text-center text-gray-500">Loading data...</td></tr>
                        ) : filteredPlans.length === 0 ? (
                            <tr><td colSpan={19} className="p-10 text-center text-gray-500">No action plans found.</td></tr>
                        ) : (
                            filteredPlans.map((p, idx) => (
                                <tr key={p.id} className="hover:bg-blue-50/50 group transition-colors">
                                    <td className="px-3 py-2 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                                    <td className="px-3 py-2 font-medium text-gray-900 border-r border-gray-100 whitespace-nowrap">{p.pic}</td>
                                    <td className="px-3 py-2 text-gray-800 border-r border-gray-100 font-medium whitespace-nowrap">{p.plan}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-xs truncate" title={p.program}>{p.program}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-xs truncate" title={p.notes}>{p.notes}</td>

                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 truncate">{p.indikator}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100">{p.lokasi}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 w-24 whitespace-nowrap">
                                        {p.startDate ? format(new Date(p.startDate), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 w-24 whitespace-nowrap">
                                        {p.endDate ? format(new Date(p.endDate), 'MMM dd, yyyy') : '-'}
                                    </td>

                                    <td className="px-3 py-2 text-center font-semibold text-indigo-600 border-r border-gray-100">{p.targetActivity}</td>
                                    <td className="px-3 py-2 text-center text-gray-700 border-r border-gray-100">{p.realActivity || 0}</td>

                                    <td className="px-3 py-2 border-r border-gray-100">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${p.realWeek1?.toLowerCase().includes('done')
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {p.realWeek1 || 'Pending'}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.targetReceiver}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 uppercase text-[10px] font-semibold">{p.goal}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.position}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.subdivisi}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.div}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.executingAgency}</td>
                                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 whitespace-nowrap">{p.classification}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <UploadActionPlanModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
            {/* Note: Create Modal needs update later to support new fields, but handled next */}
            <CreateActionPlanModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                initialData={editingPlan}
            />
        </div>
    )
}

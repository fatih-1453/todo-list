"use client"

import React, { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Loader2, TrendingUp, CheckCircle, Clock, AlertCircle, Target, Wallet, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react"
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts"
import { SmartReportModal } from "@/components/kpi/SmartReportModal"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { addDays, startOfMonth, endOfMonth } from "date-fns"

// Types matching ActionPlan schema
interface ActionPlan {
    id: number
    plan: string
    div?: string // Group
    dueDate?: string
    startDate?: string
    createdAt?: string
    realWeek1?: string // Status
    targetNominal?: number | string
    realNominal?: number | string
    department?: string
    pic?: string
}

export default function DashboardPage() {
    // 1. Fetch Data
    const { data: plans, isLoading } = useQuery<ActionPlan[]>({
        queryKey: ["actionPlans"],
        queryFn: () => apiClient.get<ActionPlan[]>("/action-plans"),
        refetchInterval: 30000 // Live updates every 30s
    })

    // Search State
    const [searchQuery, setSearchQuery] = React.useState("")

    // Date Range State (Default: Current Month)
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    })

    // 2. Metrics Calculation
    const metrics = useMemo(() => {
        if (!plans || plans.length === 0) return null

        // Filter Plans based on Search AND Date Range
        const filteredPlans = plans.filter(p => {
            // 1. Search Filter
            let matchesSearch = true
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase()
                matchesSearch = (
                    p.plan?.toLowerCase().includes(lowerQuery) ||
                    p.div?.toLowerCase().includes(lowerQuery) ||
                    p.pic?.toLowerCase().includes(lowerQuery) ||
                    p.department?.toLowerCase().includes(lowerQuery) || false
                )
            }

            // 2. Date Range Filter
            let matchesDate = true
            if (dateRange?.from && dateRange?.to && p.dueDate) {
                const planDate = new Date(p.dueDate)
                if (!isNaN(planDate.getTime())) {
                    // Normalize times for accurate comparison
                    const start = new Date(dateRange.from)
                    start.setHours(0, 0, 0, 0)

                    const end = new Date(dateRange.to)
                    end.setHours(23, 59, 59, 999)

                    matchesDate = planDate >= start && planDate <= end
                }
            }

            return matchesSearch && matchesDate
        })

        let totalPlans = filteredPlans.length
        let completed = 0
        let inProgress = 0
        let pending = 0

        let totalTarget = 0
        let totalRealization = 0

        const statusDistribution = [
            { name: "Done", value: 0, color: "#10b981" }, // Emerald 500
            { name: "In Progress", value: 0, color: "#3b82f6" }, // Blue 500
            { name: "Pending", value: 0, color: "#f59e0b" }, // Amber 500
        ]

        const financialData: Record<string, { target: number, real: number }> = {}
        const departmentData: Record<string, { total: number, completed: number }> = {}
        const picData: Record<string, { total: number, completed: number }> = {} // New: PIC Data
        const trendData: Record<string, number> = {} // Plans due by Month

        filteredPlans.forEach(p => {
            // Status Logic
            let isDone = false
            let isStarted = false

            const tNominal = Number(p.targetNominal) || 0
            const rNominal = Number(p.realNominal) || 0

            // Accumulate Financials
            totalTarget += tNominal
            totalRealization += rNominal

            if ((p.realWeek1 && p.realWeek1.toLowerCase().includes('done')) || (tNominal > 0 && rNominal >= tNominal)) {
                isDone = true
                completed++
                statusDistribution[0].value++
            } else if (rNominal > 0) {
                isStarted = true
                inProgress++
                statusDistribution[1].value++
            } else {
                pending++
                statusDistribution[2].value++
            }

            // Division/Dept Aggregation
            const divName = p.div || "Unassigned"
            if (!departmentData[divName]) departmentData[divName] = { total: 0, completed: 0 }
            departmentData[divName].total++
            if (isDone) departmentData[divName].completed++

            if (!financialData[divName]) financialData[divName] = { target: 0, real: 0 }
            financialData[divName].target += tNominal
            financialData[divName].real += rNominal

            // PIC Aggregation
            const picName = p.pic || "Unassigned"
            if (!picData[picName]) picData[picName] = { total: 0, completed: 0 }
            picData[picName].total++
            if (isDone) picData[picName].completed++

            // Trend (by Due Date Month)
            if (p.dueDate) {
                const date = new Date(p.dueDate)
                if (!isNaN(date.getTime())) {
                    const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' })
                    trendData[monthKey] = (trendData[monthKey] || 0) + 1
                }
            }
        })

        const completionRate = totalPlans > 0 ? Math.round((completed / totalPlans) * 100) : 0

        // Arrays for Charts
        const financialChartData = Object.keys(financialData).map(k => ({
            name: k,
            Target: financialData[k].target,
            Realization: financialData[k].real
        }))

        const departmentChartData = Object.keys(departmentData).map(k => ({
            name: k,
            Completion: Math.round((departmentData[k].completed / departmentData[k].total) * 100),
            Total: departmentData[k].total
        }))

        const picChartData = Object.keys(picData).map(k => ({
            name: k,
            Completion: Math.round((picData[k].completed / picData[k].total) * 100),
            Total: picData[k].total,
            CompletedCount: picData[k].completed
        })).sort((a, b) => b.Total - a.Total).slice(0, 10) // Top 10 PICs by workload

        // Sort trends chronologically? Hard with 'Jan 26' string keys.
        // Simple mock sort or just object entries if keys constructed chronologically.
        // For simplicity, let's just map entries.
        const trendChartData = Object.entries(trendData).map(([k, v]) => ({ name: k, Plans: v }))

        return {
            totalPlans,
            completed,
            inProgress,
            pending,
            completionRate,
            totalTarget,
            totalRealization,
            statusDistribution,
            financialChartData,
            departmentChartData,
            picChartData,
            trendChartData
        }
    }, [plans, searchQuery, dateRange])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50/50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        )
    }

    if (!metrics) return <div className="p-8">No Data Available</div>

    // Formatting for Currency
    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50/30 font-sans space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">KPI Dashboard</h1>
                    <p className="text-gray-500 mt-1">Real-time overview of Action Plans and Performance.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Date Range Picker */}
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />

                    {/* Search Input */}
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search Plan, PIC, Division..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Layers className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Last updated: just now</span>
                    </div>

                    {/* Smart Report Generator */}
                    <SmartReportModal
                        plans={plans || []}
                        dateFrom={dateRange?.from}
                        dateTo={dateRange?.to}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Plans */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-600">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Plans</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{metrics.totalPlans}</div>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                            <span>Filtered Plans</span>
                        </div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-[100px] transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100/50 rounded-lg text-green-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Completion</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{metrics.completionRate}%</div>
                        <div className="flex items-center mt-2 text-xs text-green-600 font-medium">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>{metrics.completed} Completed</span>
                        </div>
                    </div>
                </div>

                {/* Financial Target */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                <Target className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Target Value</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 truncate" title={formatRp(metrics.totalTarget)}>
                            {metrics.totalTarget >= 1000000000
                                ? `${(metrics.totalTarget / 1000000000).toFixed(1)}M`
                                : formatRp(metrics.totalTarget)}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                            <span>Filtered Value</span>
                        </div>
                    </div>
                </div>

                {/* Realization */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Realization</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 truncate" title={formatRp(metrics.totalRealization)}>
                            {metrics.totalRealization >= 1000000000
                                ? `${(metrics.totalRealization / 1000000000).toFixed(1)}M`
                                : formatRp(metrics.totalRealization)}
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            {metrics.totalRealization >= metrics.totalTarget ? (
                                <span className="text-green-600 flex items-center font-medium">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    On Track
                                </span>
                            ) : (
                                <span className="text-amber-600 flex items-center font-medium">
                                    <ArrowDownRight className="w-3 h-3 mr-1" />
                                    Below Target
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut: Status Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Status</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {metrics.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', borderColor: '#f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Area: Activity Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Trend (Due Dates)</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.trendChartData}>
                                <defs>
                                    <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', borderColor: '#f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Plans"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPlans)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar: Financial Performance */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Performance (Target vs Real)</h3>
                    <div className="flex-1 min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.financialChartData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#6b7280' }}
                                    interval={0}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', borderColor: '#f3f4f6' }}
                                    formatter={(val: number | undefined) => formatRp(val || 0)}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Target" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="Realization" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar: Division Completion */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Division Completion Rate (%)</h3>
                    <div className="flex-1 min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={metrics.departmentChartData}
                                layout="vertical"
                                margin={{ left: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', borderColor: '#f3f4f6' }}
                                />
                                <Bar
                                    dataKey="Completion"
                                    fill="#10b981"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                    background={{ fill: '#f3f4f6' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* New Bar: Top 10 PIC Workload */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">PIC Workload (Top 10)</h3>
                    <div className="flex-1 min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={metrics.picChartData}
                                layout="vertical"
                                margin={{ left: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', borderColor: '#f3f4f6' }}
                                />
                                <Bar
                                    dataKey="Total"
                                    name="Total Plans"
                                    fill="#8b5cf6"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                    background={{ fill: '#f3f4f6' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

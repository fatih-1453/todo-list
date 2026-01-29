"use client"

import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import {
    Loader2, TrendingUp, CheckCircle, Target, Wallet,
    ArrowUpRight, ArrowDownRight, Layers, Search, Sparkles
} from "lucide-react"
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { SmartReportModal } from "@/components/kpi/SmartReportModal"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth } from "date-fns"

// Types matching ActionPlan schema
interface ActionPlan {
    id: number
    plan: string
    div?: string
    dueDate?: string
    startDate?: string
    createdAt?: string
    realWeek1?: string
    targetNominal?: number | string
    realNominal?: number | string
    department?: string
    pic?: string
}

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
}

export default function DashboardPage() {
    // 1. Fetch Data
    const { data: plans, isLoading } = useQuery<ActionPlan[]>({
        queryKey: ["actionPlans"],
        queryFn: () => apiClient.get<ActionPlan[]>("/action-plans"),
        refetchInterval: 30000
    })

    // Search & Date State
    const [searchQuery, setSearchQuery] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    })
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    // 2. Metrics Calculation
    const metrics = useMemo(() => {
        if (!plans || plans.length === 0) return null

        const filteredPlans = plans.filter(p => {
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

            let matchesDate = true
            if (dateRange?.from && dateRange?.to && p.dueDate) {
                const planDate = new Date(p.dueDate)
                if (!isNaN(planDate.getTime())) {
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
            { name: "Done", value: 0, color: "#10b981" },
            { name: "In Progress", value: 0, color: "#6366f1" },
            { name: "Pending", value: 0, color: "#f59e0b" },
        ]

        const financialData: Record<string, { target: number, real: number }> = {}
        const departmentData: Record<string, { total: number, completed: number }> = {}
        const picData: Record<string, { total: number, completed: number }> = {}
        const trendData: Record<string, number> = {}

        filteredPlans.forEach(p => {
            let isDone = false
            const tNominal = Number(p.targetNominal) || 0
            const rNominal = Number(p.realNominal) || 0

            totalTarget += tNominal
            totalRealization += rNominal

            if ((p.realWeek1 && p.realWeek1.toLowerCase().includes('done')) || (tNominal > 0 && rNominal >= tNominal)) {
                isDone = true
                completed++
                statusDistribution[0].value++
            } else if (rNominal > 0) {
                inProgress++
                statusDistribution[1].value++
            } else {
                pending++
                statusDistribution[2].value++
            }

            const divName = p.div || "Unassigned"
            if (!departmentData[divName]) departmentData[divName] = { total: 0, completed: 0 }
            departmentData[divName].total++
            if (isDone) departmentData[divName].completed++

            if (!financialData[divName]) financialData[divName] = { target: 0, real: 0 }
            financialData[divName].target += tNominal
            financialData[divName].real += rNominal

            const picName = p.pic || "Unassigned"
            if (!picData[picName]) picData[picName] = { total: 0, completed: 0 }
            picData[picName].total++
            if (isDone) picData[picName].completed++

            if (p.dueDate) {
                const date = new Date(p.dueDate)
                if (!isNaN(date.getTime())) {
                    const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' })
                    trendData[monthKey] = (trendData[monthKey] || 0) + 1
                }
            }
        })

        const completionRate = totalPlans > 0 ? Math.round((completed / totalPlans) * 100) : 0

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
        })).sort((a, b) => b.Total - a.Total).slice(0, 10)

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

    const formatRp = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        )
    }

    if (!metrics) return <div className="p-8 text-center text-gray-500">No Data Available</div>

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
            {/* Top Decoration Background */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 -z-10 pointer-events-none" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
            >
                {/* Header & Smart Control Bar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                KPI Dashboard <span className="text-indigo-600">.</span>
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg font-medium">Performance Insights & Analytics</p>
                        </div>

                        {/* Smart Control Bar */}
                        <motion.div
                            className="flex flex-col sm:flex-row items-center gap-3 p-1.5 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50/50"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-full sm:w-80' : 'w-full sm:w-64'}`}>
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-indigo-500' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Search insights..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-0 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                />
                            </div>

                            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                            <div className="dashboard-date-picker">
                                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                            </div>

                            <SmartReportModal
                                plans={plans || []}
                                dateFrom={dateRange?.from}
                                dateTo={dateRange?.to}
                            />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Metrics Grid */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        {
                            title: "Total Plans",
                            value: metrics.totalPlans,
                            sub: "Active Items",
                            icon: Layers,
                            color: "indigo",
                            gradient: "from-indigo-500 to-violet-500"
                        },
                        {
                            title: "Completion Rate",
                            value: `${metrics.completionRate}%`,
                            sub: `${metrics.completed} Completed`,
                            icon: CheckCircle,
                            color: "emerald",
                            gradient: "from-emerald-500 to-teal-500"
                        },
                        {
                            title: "Target Value",
                            value: metrics.totalTarget >= 1000000000 ? `${(metrics.totalTarget / 1000000000).toFixed(1)}M` : formatRp(metrics.totalTarget),
                            sub: "Planned Budget",
                            icon: Target,
                            color: "blue",
                            gradient: "from-blue-500 to-cyan-500"
                        },
                        {
                            title: "Realization",
                            value: metrics.totalRealization >= 1000000000 ? `${(metrics.totalRealization / 1000000000).toFixed(1)}M` : formatRp(metrics.totalRealization),
                            sub: metrics.totalRealization >= metrics.totalTarget ? "On Track" : "Below Target",
                            icon: Wallet,
                            color: metrics.totalRealization >= metrics.totalTarget ? "emerald" : "amber",
                            gradient: metrics.totalRealization >= metrics.totalTarget ? "from-emerald-500 to-teal-500" : "from-amber-500 to-orange-500"
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={item.title}
                            variants={itemVariants}
                            whileHover={{ y: -5, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg shadow-slate-200/50 relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-5 rounded-bl-full transition-transform duration-500 group-hover:scale-110`} />

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg shadow-${item.color}-500/20`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{item.title}</h3>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{item.value}</div>
                                <div className="flex items-center mt-2 text-sm font-medium text-slate-400">
                                    {item.title === "Realization" ? (
                                        item.sub === "On Track" ? <ArrowUpRight className="w-4 h-4 mr-1 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 mr-1 text-amber-500" />
                                    ) : null}
                                    <span className={item.title === "Completion Rate" ? "text-emerald-600" : ""}>{item.sub}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Trend */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Activity Analytics</h3>
                                <p className="text-slate-500 text-sm">Action plans due over time</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.trendChartData}>
                                    <defs>
                                        <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Plans"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorPlans)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Status Distribution */}
                    <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Status Overview</h3>
                        <p className="text-slate-500 text-sm mb-6">Distribution of plan statuses</p>
                        <div className="h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        cornerRadius={8}
                                    >
                                        {metrics.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#f3f4f6' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                                <span className="text-3xl font-black text-slate-800">{metrics.totalPlans}</span>
                                <p className="text-xs text-slate-400 font-medium uppercase mt-1">Total</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Secondary Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Financial Performance */}
                    <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <Wallet className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Financial Performance</h3>
                                <p className="text-slate-500 text-xs">Target vs Realization by Division</p>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.financialChartData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: number) => formatRp(val)}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Target" fill="#93c5fd" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                    <Bar dataKey="Realization" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* PIC Workload */}
                    <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 rounded-xl">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Top Performers</h3>
                                <p className="text-slate-500 text-xs">Based on completed tasks</p>
                            </div>
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.picChartData} layout="vertical" margin={{ left: 40, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="CompletedCount"
                                        name="Completed Plans"
                                        fill="#10b981"
                                        radius={[0, 6, 6, 0]}
                                        barSize={24}
                                        background={{ fill: '#f1f5f9', radius: [0, 6, 6, 0] }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

"use client"

import React, { useState, useMemo } from "react"
import { Gantt, Task, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Loader2, Plus, Filter, Layers, Download, ChevronRight, Folder, FileText, ChevronLeft, Search, RotateCcw } from "lucide-react"

import { ActionPlan } from "@/types/action-plan"

interface UpdatePlanPayload {
    id: number
    data: Partial<ActionPlan>
}

import { motion } from "framer-motion"

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
        transition: { type: "spring" as const, stiffness: 100 }
    }
}

export default function TimelinePage() {
    const queryClient = useQueryClient()
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
    const [isChecked, setIsChecked] = useState(true)
    const [isGroupOpen, setIsGroupOpen] = useState<Record<string, boolean>>({})

    // Filter State
    const currentYear = new Date().getFullYear();
    const [filterYear, setFilterYear] = useState(currentYear);
    const [filterMonth, setFilterMonth] = useState<string>("All"); // "All", "1"..."12"

    // Active Filters (Applied on "Cari")
    const [activeFilters, setActiveFilters] = useState({
        year: currentYear,
        month: "All"
    });

    // Fetch Action Plans instead of Tasks
    const { data: plans, isLoading } = useQuery<ActionPlan[]>({
        queryKey: ["actionPlans"],
        queryFn: () => apiClient.get<ActionPlan[]>("/action-plans"),
    })

    const updatePlanMutation = useMutation({
        mutationFn: ({ id, data }: UpdatePlanPayload) => apiClient.put(`/action-plans/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["actionPlans"] })
        },
    })

    const handleSearch = () => {
        setActiveFilters({
            year: filterYear,
            month: filterMonth
        });
    }

    const handleReset = () => {
        setFilterYear(currentYear);
        setFilterMonth("All");
        setActiveFilters({
            year: currentYear,
            month: "All"
        });
    }

    // Smart Summary Stats
    const stats = useMemo(() => {
        if (!plans) return { total: 0, onTrack: 0, completed: 0 }
        const total = plans.length
        const completed = plans.filter(p => p.status?.toLowerCase().includes('done')).length
        const onTrack = plans.filter(p => p.status?.toLowerCase().includes('on progress')).length
        return { total, completed, onTrack }
    }, [plans])

    // Transform and Filter ActionPlans
    const ganttTasks: Task[] = useMemo(() => {
        if (!plans || plans.length === 0) return []

        // --- 1. Filter Logic ---
        const filteredPlans = plans.filter(p => {
            if (!p.startDate) return false;
            const d = new Date(p.startDate);

            // Year Filter
            if (d.getFullYear() !== activeFilters.year) return false;

            // Month Filter
            if (activeFilters.month !== "All") {
                // Month is 0-indexed in JS, but UI is 1-12
                if (d.getMonth() + 1 !== parseInt(activeFilters.month)) return false;
            }

            return true;
        });

        // Data Structure: Division -> PIC -> Plans[]
        const hierarchy: Record<string, Record<string, ActionPlan[]>> = {}

        filteredPlans.forEach(p => {
            const divName = p.divisi || "Unassigned Division"
            const picName = p.pic || "Unassigned PIC"

            if (!hierarchy[divName]) hierarchy[divName] = {}
            if (!hierarchy[divName][picName]) hierarchy[divName][picName] = []

            hierarchy[divName][picName].push(p)
        })

        let finalTasks: Task[] = []
        let displayOrderCounter = 1;

        // Sort Groups Alphabetically
        const sortedDivisions = Object.keys(hierarchy).sort()

        sortedDivisions.forEach(divName => {
            const divId = `div-${divName.replace(/\s+/g, '-')}`
            const picsInDiv = hierarchy[divName]

            // Calculate Division Aggregates
            let divMinStart = new Date(8640000000000000)
            let divMaxEnd = new Date(-8640000000000000)
            let totalDivProgress = 0
            let totalDivTasks = 0

            // Temporary storage for PIC Tasks to be added after Division
            const picTasksToAdd: Task[] = []

            Object.keys(picsInDiv).sort().forEach(picName => {
                const picId = `pic-${divName.replace(/\s+/g, '-')}-${picName.replace(/\s+/g, '-')}`
                const plansInPic = picsInDiv[picName]

                let picMinStart = new Date(8640000000000000)
                let picMaxEnd = new Date(-8640000000000000)
                let picProgressSum = 0

                // Map Plans to Tasks
                const planTasks: Task[] = plansInPic.map((p, index) => {
                    // Start Date Priority: startDate > createdAt > now
                    let start = p.startDate ? new Date(p.startDate) : (p.createdAt ? new Date(p.createdAt) : new Date());

                    // End Date Priority: endDate > start + 1 day
                    let end = p.endDate ? new Date(p.endDate) : new Date(start.getTime() + 86400000);

                    // Ensure valid dates & range
                    if (isNaN(start.getTime())) start = new Date();
                    if (isNaN(end.getTime()) || end <= start) {
                        end = new Date(start.getTime() + 86400000);
                    }

                    // Update Min/Max for PIC
                    if (start < picMinStart) picMinStart = start
                    if (end > picMaxEnd) picMaxEnd = end

                    // Calculate Progress
                    let progress = 0;
                    const status = p.status?.toLowerCase() || '';

                    if (status.includes('done')) {
                        progress = 100;
                    }
                    else if (status.includes('on progres')) {
                        // Use ratio if available, otherwise 50%
                        if ((p.targetActivity || 0) > 0) {
                            progress = Math.min(Math.round(((p.realActivity || 0) / (p.targetActivity || 1)) * 100), 100);
                        } else {
                            progress = 50;
                        }
                    }
                    else if (status.includes('progres')) {
                        if ((p.targetActivity || 0) > 0) {
                            progress = Math.min(Math.round(((p.realActivity || 0) / (p.targetActivity || 1)) * 100), 100);
                        } else {
                            progress = 25; // Distinct from On Progres
                        }
                    }
                    else if ((p.targetActivity || 0) > 0 && (p.realActivity || 0) > 0) {
                        progress = Math.min(Math.round(((p.realActivity || 0) / (p.targetActivity || 1)) * 100), 100);
                    }

                    picProgressSum += progress

                    // Color Code
                    let barColor = "#ff5722" // Deep Orange to match reference
                    if (progress === 100) barColor = "#10b981" // Green

                    return {
                        start,
                        end,
                        name: p.lead,
                        id: String(p.id),
                        type: "task",
                        progress: progress,
                        isDisabled: false,
                        project: picId, // Logically belongs to PIC
                        styles: {
                            progressColor: barColor,
                            backgroundColor: "#ffccbc", // Deep Orange 100 - Solid and visible
                            backgroundSelectedColor: "#ffab91", // Deep Orange 200
                        },
                        displayOrder: 0, // Set later
                        // Custom data for rendering
                        // @ts-ignore
                        level: "plan"
                    } as Task
                })

                // Update Division stats
                if (picMinStart < divMinStart) divMinStart = picMinStart
                if (picMaxEnd > divMaxEnd) divMaxEnd = picMaxEnd
                totalDivProgress += picProgressSum
                totalDivTasks += plansInPic.length

                // Create PIC Task (Project Type)
                const picTask: Task = {
                    start: picMinStart.getTime() === 8640000000000000 ? new Date() : picMinStart,
                    end: picMaxEnd.getTime() === -8640000000000000 ? new Date() : picMaxEnd,
                    name: picName,
                    id: picId,
                    type: "project",
                    progress: plansInPic.length > 0 ? Math.round(picProgressSum / plansInPic.length) : 0,
                    hideChildren: !isGroupOpen[picId],
                    displayOrder: 0, // Set later
                    project: divId,
                    styles: {
                        backgroundColor: "#ffedd5", // Orange 100 - Visible but distinct from Div
                        progressColor: "#ea580c", // Orange 600
                        backgroundSelectedColor: "#fed7aa",
                    },
                    // @ts-ignore
                    level: "pic",
                    _children: planTasks // Store for flattening
                }

                picTasksToAdd.push(picTask)
            })

            // Add Division Task
            finalTasks.push({
                start: divMinStart.getTime() === 8640000000000000 ? new Date() : divMinStart,
                end: divMaxEnd.getTime() === -8640000000000000 ? new Date() : divMaxEnd,
                name: divName,
                id: divId,
                type: "project",
                progress: totalDivTasks > 0 ? Math.round(totalDivProgress / totalDivTasks) : 0,
                hideChildren: !isGroupOpen[divId],
                displayOrder: displayOrderCounter++,
                styles: {
                    backgroundColor: "#fed7aa", // Orange 200 - Darker for visibility
                    progressColor: "#ea580c", // Orange 600
                    backgroundSelectedColor: "#fdba74", // Orange 300
                },
                // @ts-ignore
                level: "division"
            })

            // Add PICs and Plans if Division is Open
            if (isGroupOpen[divId]) {
                picTasksToAdd.forEach(picResult => {
                    // Add PIC
                    picResult.displayOrder = displayOrderCounter++
                    finalTasks.push(picResult)

                    // Add Plans if PIC is Open
                    if (isGroupOpen[picResult.id]) {
                        // @ts-ignore
                        const children = picResult._children as Task[]
                        children.forEach(c => {
                            c.displayOrder = displayOrderCounter++
                            finalTasks.push(c)
                        })
                    }
                })
            }
        })

        return finalTasks
    }, [plans, isGroupOpen, activeFilters])


    const handleTaskChange = (task: Task) => {
        const id = parseInt(task.id)
        if (isNaN(id)) return // Block project drags

        // Update BOTH Start and End dates on Drag/Resize
        updatePlanMutation.mutate({
            id,
            data: {
                startDate: task.start.toISOString(),
                endDate: task.end.toISOString(),
            }
        })
    }

    const handleDateEdit = (id: number, field: 'startDate' | 'endDate', newDate: string) => {
        updatePlanMutation.mutate({
            id,
            data: {
                [field]: new Date(newDate).toISOString()
            }
        })
    }

    const handleExpanderClick = (task: Task) => {
        // Toggle Open State
        setIsGroupOpen(prev => ({
            ...prev,
            [task.id]: !prev[task.id] // Toggle boolean
        }))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50/50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    // Generate Month Options
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return (
        <div className="p-6 h-full flex flex-col bg-slate-50/50 font-sans">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-6 h-full"
            >
                {/* Header & Stats */}
                <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                    <div>
                        <motion.h1 variants={itemVariants} className="text-3xl font-extrabold text-slate-900 tracking-tight">Timeline <span className="text-indigo-500">Master</span></motion.h1>
                        <motion.p variants={itemVariants} className="text-slate-500 mt-1 text-sm font-medium">Visualize & Track Action Plans in Real-time.</motion.p>
                    </div>

                    {/* Mini Stats */}
                    <motion.div variants={itemVariants} className="flex gap-4">
                        <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">Total Plans</div>
                                <div className="text-lg font-black text-slate-800 leading-none">{stats.total}</div>
                            </div>
                        </div>
                        <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">Completed</div>
                                <div className="text-lg font-black text-slate-800 leading-none">{stats.completed}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filter Toolbar - Updated Style */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-end md:items-center gap-4 bg-white p-2 rounded-2xl border border-indigo-50 shadow-lg shadow-indigo-100/50">
                    {/* Year Stepper */}
                    <div className="flex items-center bg-slate-50 rounded-xl px-2 py-1.5 border border-slate-100">
                        <button
                            onClick={() => setFilterYear(prev => prev - 1)}
                            className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-all text-slate-400"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="mx-4 font-bold text-slate-700 min-w-[50px] text-center">{filterYear}</span>
                        <button
                            onClick={() => setFilterYear(prev => prev + 1)}
                            className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg transition-all text-slate-400"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Month Dropdown */}
                    <select
                        className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:bg-white hover:shadow-sm transition-all min-w-[140px]"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    >
                        <option value="All">All Months</option>
                        {months.map((m, idx) => (
                            <option key={m} value={String(idx + 1)}>{m}</option>
                        ))}
                    </select>

                    <div className="w-px h-8 bg-slate-100 hidden md:block" />

                    {/* View Mode Switcher */}
                    <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button
                            onClick={() => setViewMode(ViewMode.Day)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === ViewMode.Day ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setViewMode(ViewMode.Week)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === ViewMode.Week ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode(ViewMode.Month)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === ViewMode.Month ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Month
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={handleSearch}
                            className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                        >
                            <Search className="w-3 h-3 mr-2" />
                            Filter
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full text-xs font-bold transition-all active:scale-95"
                        >
                            <RotateCcw className="w-3 h-3 mr-2" />
                            Reset
                        </button>
                    </div>
                </motion.div>

                {/* Gantt Area */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
                    <div className="flex-1 overflow-x-auto">
                        {ganttTasks.length > 0 ? (
                            <div className="min-w-[800px] h-full">
                                <Gantt
                                    tasks={ganttTasks}
                                    viewMode={viewMode}
                                    onDateChange={handleTaskChange}
                                    onExpanderClick={handleExpanderClick}
                                    listCellWidth={isChecked ? "600px" : ""} // Widen to fit colums
                                    columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 200 : 60}
                                    headerHeight={60}
                                    rowHeight={50}
                                    barFill={70}
                                    barCornerRadius={4}
                                    handleWidth={8}
                                    fontFamily="inherit"
                                    arrowColor="#cbd5e1"
                                    arrowIndent={20}
                                    todayColor="rgba(239, 68, 68, 0.1)"
                                    TaskListHeader={({ headerHeight, fontFamily, fontSize, rowWidth }) => {
                                        return (
                                            <div
                                                className="flex items-center border-b border-gray-200 bg-white"
                                                style={{
                                                    height: headerHeight,
                                                    fontFamily,
                                                    fontSize,
                                                    width: rowWidth,
                                                }}
                                            >
                                                <div className="flex-1 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider h-full flex items-center min-w-[200px]">
                                                    Division / PIC / Plan
                                                </div>
                                                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider h-full flex items-center w-[80px] justify-center">
                                                    Progress
                                                </div>
                                                {/* Start Date Header */}
                                                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider h-full flex items-center w-[120px] justify-center">
                                                    Start Date
                                                </div>
                                                {/* End Date Header */}
                                                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider h-full flex items-center w-[140px] justify-center">
                                                    End Date
                                                </div>
                                            </div>
                                        );
                                    }}
                                    TaskListTable={({
                                        rowHeight,
                                        rowWidth,
                                        tasks,
                                        fontFamily,
                                        fontSize,
                                        locale,
                                        onExpanderClick,
                                    }) => {
                                        return (
                                            <div
                                                className="border-r border-gray-200 bg-white"
                                                style={{
                                                    fontFamily,
                                                    fontSize,
                                                    width: rowWidth,
                                                }}
                                            >
                                                {tasks.map((t) => {
                                                    // @ts-ignore
                                                    const level = t.level || "plan";
                                                    const isGroup = level !== "plan"; // Div or PIC

                                                    return (
                                                        <div
                                                            key={t.id}
                                                            className={`flex items-center border-b border-gray-50 transition-colors group/row ${isGroup ? 'bg-white cursor-pointer hover:bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                                                            style={{
                                                                height: rowHeight,
                                                            }}
                                                            onClick={(e) => {
                                                                // Only toggle if not clicking Input
                                                                if (isGroup && (e.target as HTMLElement).tagName !== 'INPUT') {
                                                                    handleExpanderClick(t);
                                                                }
                                                            }}
                                                        >
                                                            {/* Hierarchical Column */}
                                                            <div
                                                                className="flex-1 px-4 h-full flex items-center min-w-[200px] overflow-hidden truncate"
                                                            >
                                                                {/* Level 1: Division */}
                                                                {level === 'division' && (
                                                                    <div className="flex items-center w-full text-gray-700 font-bold select-none">
                                                                        <Folder className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                                                                        <span className="flex-1 truncate uppercase">{t.name}</span>
                                                                        <ChevronRight
                                                                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-2 ${!t.hideChildren ? 'rotate-90' : ''}`}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Level 2: PIC */}
                                                                {level === 'pic' && (
                                                                    <div className="flex items-center w-full pl-8 text-gray-700 font-medium select-none">
                                                                        {/* Custom PIC Icon or just Folder */}
                                                                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3 flex-shrink-0 text-orange-600 text-[10px] font-bold">
                                                                            {t.name.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <span className="flex-1 truncate">{t.name}</span>
                                                                        <ChevronRight
                                                                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-2 ${!t.hideChildren ? 'rotate-90' : ''}`}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Level 3: Plan */}
                                                                {level === 'plan' && (
                                                                    <div className="flex items-center w-full pl-16">
                                                                        <FileText className="w-4 h-4 mr-3 text-gray-300 flex-shrink-0" />
                                                                        <span className="text-sm text-gray-500 group-hover/row:text-gray-900 transition-colors truncate">{t.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Progress Column */}
                                                            <div className="px-4 h-full flex items-center w-[80px] justify-center text-xs">
                                                                <div className={`px-0 font-medium ${t.progress === 100 ? 'text-green-600' : 'text-gray-400'}`}>
                                                                    {t.progress}%
                                                                </div>
                                                            </div>

                                                            {/* Start Date Column (Read-Only) */}
                                                            <div className="px-4 h-full flex items-center justify-center w-[120px] text-xs text-gray-400">
                                                                {!isGroup ? (
                                                                    <input
                                                                        type="date"
                                                                        className="w-full bg-gray-50/50 border border-transparent rounded px-1 text-xs text-gray-400 focus:outline-none cursor-not-allowed"
                                                                        value={!isNaN(t.start.getTime()) ? t.start.toISOString().split('T')[0] : ""}
                                                                        disabled={true}
                                                                    />
                                                                ) : ""}
                                                            </div>

                                                            {/* End Date Column (Editable for Plans only) */}
                                                            <div className="px-4 h-full flex items-center justify-center w-[140px] text-xs text-gray-400">
                                                                {!isGroup ? (
                                                                    <input
                                                                        type="date"
                                                                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-indigo-500 rounded px-1 text-xs text-gray-600 focus:outline-none transition-colors"
                                                                        value={!isNaN(t.end.getTime()) ? t.end.toISOString().split('T')[0] : ""}
                                                                        onChange={(e) => {
                                                                            const id = parseInt(t.id);
                                                                            const val = e.target.value;
                                                                            if (!isNaN(id) && val) {
                                                                                handleDateEdit(id, 'endDate', val);
                                                                            }
                                                                        }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                ) : ""}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Layers className="w-16 h-16 mb-4 text-gray-200" />
                                <h3 className="text-lg font-semibold text-gray-900">No Action Plans Found</h3>
                                <p className="text-sm max-w-xs text-center mt-2">Go to Action Plan menu to create new plans.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

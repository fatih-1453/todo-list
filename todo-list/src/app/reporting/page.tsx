
"use client"

import React, { useState, useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { ActionPlan } from "@/types/action-plan"
import {
    Loader2, FileText, Search, Filter, Calendar, TrendingUp,
    AlertTriangle, CheckCircle, Target, Wallet, ArrowRight,
    Building2, Printer, Download, UserCircle, Briefcase, Trophy,
    Folder, FolderOpen, ChevronRight, ChevronDown, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import {
    format, startOfWeek, endOfWeek, endOfMonth, endOfQuarter, endOfYear,
    addWeeks, addMonths, isWithinInterval, getWeek, eachDayOfInterval,
    differenceInCalendarDays, addDays, isSameDay
} from "date-fns"
import { id } from "date-fns/locale"
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts"
// import html2canvas from 'html2canvas' // Removed in favor of html-to-image
import jsPDF from 'jspdf'
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useUsers } from "@/hooks/useUsers"

// Types
type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'semester' | 'yearly';

interface DivisiPerformance {
    name: string;
    total: number;
    completed: number;
    pending: number;
    score: number;
    budget: number;
    realization: number;
}

interface PersonPerformance {
    name: string;
    divisi: string;
    total: number;
    completed: number;
    pending: number;
    score: number;
}

export default function ReportingPage() {
    // -------------------------------------------------------------------------
    // 1. Data Fetching
    // -------------------------------------------------------------------------
    const { data: plans, isLoading: isLoadingPlans } = useQuery<ActionPlan[]>({
        queryKey: ["actionPlans"],
        queryFn: () => apiClient.get<ActionPlan[]>("/action-plans"),
        refetchInterval: 60000
    })

    const { data: users } = useUsers()

    // Extract Unique Divisions from Plans
    const uniqueDivisions = useMemo(() => {
        if (!plans) return [];
        const divs = new Set(plans.map(p => p.divisi).filter((d): d is string => !!d));
        return Array.from(divs).sort();
    }, [plans]);

    // -------------------------------------------------------------------------
    // 2. State Management
    // -------------------------------------------------------------------------
    const [selectedDivisi, setSelectedDivisi] = useState<string>("all")
    const [periodType, setPeriodType] = useState<PeriodType>("monthly")

    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
    const [selectedWeek, setSelectedWeek] = useState<string>("1")
    const [selectedQuarter, setSelectedQuarter] = useState<string>("1")
    const [selectedSemester, setSelectedSemester] = useState<string>("1")

    // For manual date range override in Weekly mode
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    const [isReportGenerated, setIsReportGenerated] = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    // -------------------------------------------------------------------------
    // 3. Logic: Date Range Calculation
    // -------------------------------------------------------------------------
    const getCalculatedDateRange = () => {
        let start: Date, end: Date;
        const year = parseInt(selectedYear);

        switch (periodType) {
            case 'weekly':
                if (dateRange?.from && dateRange?.to) {
                    return { start: dateRange.from, end: dateRange.to };
                }
                const simpleDate = new Date(year, 0, 1 + (parseInt(selectedWeek) - 1) * 7);
                start = startOfWeek(simpleDate, { weekStartsOn: 1 });
                end = endOfWeek(simpleDate, { weekStartsOn: 1 });
                break;

            case 'monthly':
                start = new Date(year, parseInt(selectedMonth) - 1, 1);
                end = endOfMonth(start);
                break;

            case 'quarterly':
                const qMonth = (parseInt(selectedQuarter) - 1) * 3;
                start = new Date(year, qMonth, 1);
                end = endOfQuarter(start);
                break;

            case 'semester':
                if (selectedSemester === "1") {
                    start = new Date(year, 0, 1);
                    end = new Date(year, 5, 30, 23, 59, 59);
                } else {
                    start = new Date(year, 6, 1);
                    end = new Date(year, 11, 31, 23, 59, 59);
                }
                break;

            case 'yearly':
                start = new Date(year, 0, 1);
                end = new Date(year, 11, 31, 23, 59, 59);
                break;

            default:
                start = new Date();
                end = new Date();
        }
        return { start, end };
    };

    // -------------------------------------------------------------------------
    // 4. Report Generation Logic
    // -------------------------------------------------------------------------
    const generatedReport = useMemo(() => {
        if (!isReportGenerated || !plans) return null;

        const { start, end } = getCalculatedDateRange();

        // Helper: Parse Date Robustly
        const parseDate = (dateStr: string | undefined | null): Date | null => {
            if (!dateStr) return null;
            // 1. Try standard Date constructor (ISO, YYYY-MM-DD)
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) return d;
            // 2. Try DD/MM/YYYY or DD-MM-YYYY (Common in ID)
            const parts = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
            if (parts) {
                return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
            }
            return null;
        };

        // A. Filter Main Data (Current Period)
        const filtered = plans.filter(p => {
            if (selectedDivisi !== "all") {
                if (p.divisi !== selectedDivisi) return false;
            }

            const d = parseDate(p.endDate);
            if (!d) return false;

            return isWithinInterval(d, { start, end });
        });

        // Current Period Metrics
        let total = filtered.length;
        let completed = 0;
        let pending = 0;
        let totalBudget = 0;
        let totalRealization = 0;

        // --- Detailed Sub-Aggregators ---
        const divisiMap: Record<string, DivisiPerformance> = {};
        const personMap: Record<string, PersonPerformance> = {};

        filtered.forEach(p => {
            const t = Number(p.targetNominal) || 0;
            const r = Number(p.realNominal) || 0;
            const isDone = (p.status?.toLowerCase().includes('done')) || (t > 0 && r >= t);

            if (isDone) completed++; else pending++;
            totalBudget += t;
            totalRealization += r;

            // Map Divisi
            const dName = p.divisi || "General";
            if (!divisiMap[dName]) divisiMap[dName] = { name: dName, total: 0, completed: 0, pending: 0, score: 0, budget: 0, realization: 0 };
            divisiMap[dName].total++;
            if (isDone) divisiMap[dName].completed++; else divisiMap[dName].pending++;
            divisiMap[dName].budget += t;
            divisiMap[dName].realization += r;

            // Map Person
            const pName = p.pic || "Unassigned";
            if (!personMap[pName]) personMap[pName] = { name: pName, divisi: dName, total: 0, completed: 0, pending: 0, score: 0 };
            personMap[pName].total++;
            if (isDone) personMap[pName].completed++; else personMap[pName].pending++;
        });

        // Calc Scores
        Object.values(divisiMap).forEach(d => {
            d.score = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
        });
        Object.values(personMap).forEach(p => {
            p.score = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
        });

        const sortedDivisions = Object.values(divisiMap).sort((a, b) => b.score - a.score);
        const sortedPeople = Object.values(personMap).sort((a, b) => b.score - a.score);

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // B. Timeline: Evaluation (Not Done in current period)
        const evaluationItems = filtered.filter(p => {
            const t = Number(p.targetNominal) || 0;
            const r = Number(p.realNominal) || 0;
            const isDone = (p.status?.toLowerCase().includes('done')) || (t > 0 && r >= t);
            return !isDone;
        });

        // C. Timeline: Future Plans (Next Week/Month)
        let futureStart: Date, futureEnd: Date;
        if (periodType === 'weekly') {
            futureStart = addWeeks(end, 0); // Start from next day basically
            futureEnd = addWeeks(futureStart, 1);
        } else {
            futureStart = addMonths(end, 0);
            futureEnd = addMonths(futureStart, 1);
        }

        const futureItems = plans.filter(p => {
            if (selectedDivisi !== "all") {
                if (p.divisi !== selectedDivisi) return false;
            }

            const d = parseDate(p.endDate);
            if (!d) return false;

            return d > end && d <= futureEnd; // STRICTLY AFTER current period end
        });

        // Group Future Items by Person (PIC) for Timeline View
        const futureByPerson: Record<string, ActionPlan[]> = {};
        futureItems.forEach(p => {
            const pName = p.pic || "Unassigned";
            if (!futureByPerson[pName]) futureByPerson[pName] = [];
            futureByPerson[pName].push(p);
        });

        // Sort People by most future items
        const sortedFuturePeople = Object.entries(futureByPerson)
            .sort(([, a], [, b]) => b.length - a.length);

        // LEGACY: Group Future Items by Divisi (Keep for safe measure or remove if unused)
        const futureByDivisi: Record<string, ActionPlan[]> = {};
        futureItems.forEach(p => {
            const dName = p.divisi || "General";
            if (!futureByDivisi[dName]) futureByDivisi[dName] = [];
            futureByDivisi[dName].push(p);
        });

        // AI Analysis Simulation
        const topDiv = sortedDivisions.length > 0 ? sortedDivisions[0] : null;
        const lowDiv = sortedDivisions.length > 0 ? sortedDivisions[sortedDivisions.length - 1] : null;

        const analysisText = `Berdasarkan evaluasi komprehensif periode ini, organisasi mencapai tingkat efektivitas ${completionRate}%. ` +
            (topDiv ? `Apresiasi diberikan kepada Divisi ${topDiv.name} yang memimpin dengan skor kinerja ${topDiv.score}%. ` : "") +
            (lowDiv && lowDiv.score < 50 ? `Perhatian khusus diperlukan untuk Divisi ${lowDiv.name} yang baru mencapai ${lowDiv.score}%, terindikasi adanya hambatan eksekusi. ` : "") +
            `Secara finansial, realisasi anggaran adalah ${totalBudget > 0 ? Math.round((totalRealization / totalBudget) * 100) : 0}% dari target.`;

        const mitigationText = pending > 0
            ? `Terdapat ${pending} rencana aksi yang meleset dari target waktu (Overdue). ` +
            `Disarankan segera melakukan Root Cause Analysis (RCA) pada level divisi, khususnya divisi dengan backlog tertinggi. ` +
            `Prioritaskan realokasi sumber daya manusia (PIC) yang memiliki beban kerja rendah untuk membantu penyelesaian inisiatif kritis.`
            : `Kinerja operasional berjalan optimal tanpa backlog signifikan. Fokus periode mendatang harus diarahkan pada peningkatan kualitas output dan inovasi strategis.`;

        // E. Gantt Chart Data Prep
        const ganttDays = eachDayOfInterval({ start: futureStart, end: futureEnd });

        // Group by Division -> User -> Tasks
        const ganttData: { name: string; users: { name: string; tasks: ActionPlan[] }[] }[] = [];
        const rawGanttDivisions: Record<string, ActionPlan[]> = {};

        futureItems.forEach(p => {
            const dName = p.divisi || "General";
            if (!rawGanttDivisions[dName]) rawGanttDivisions[dName] = [];
            rawGanttDivisions[dName].push(p);
        });

        Object.entries(rawGanttDivisions).sort().forEach(([divName, divItems]) => {
            const usersMap: Record<string, ActionPlan[]> = {};
            divItems.forEach(p => {
                const uName = p.pic || "Unassigned";
                if (!usersMap[uName]) usersMap[uName] = [];
                usersMap[uName].push(p);
            });

            const usersArray = Object.entries(usersMap).map(([uName, uTasks]) => ({
                name: uName,
                tasks: uTasks
            })).sort((a, b) => b.tasks.length - a.tasks.length);

            ganttData.push({
                name: divName,
                users: usersArray
            });
        });

        // Chart Data
        const statusData = [
            { name: "Selesai", value: completed, color: "#10b981" },
            { name: "Dalam Proses", value: pending, color: "#f59e0b" },
        ];

        // D. Pending Evaluation Grouping (By Person)
        const pendingByPerson: Record<string, ActionPlan[]> = {};
        evaluationItems.forEach(p => {
            const pName = p.pic || "Unassigned";
            if (!pendingByPerson[pName]) pendingByPerson[pName] = [];
            pendingByPerson[pName].push(p);
        });

        const sortedPendingPeople = Object.entries(pendingByPerson)
            .sort(([, a], [, b]) => b.length - a.length); // Sort by most pending items

        return {
            periodLabel: format(start, "dd MMM yyyy") + " - " + format(end, "dd MMM yyyy"),
            futurePeriodLabel: format(futureStart, "dd MMM") + " - " + format(futureEnd, "dd MMM yyyy"),
            total, completed, pending, completionRate,
            totalBudget, totalRealization,
            analysisText, mitigationText,
            evaluationItems, futureItems, futureByDivisi,
            statusData,
            sortedDivisions, sortedPeople, sortedPendingPeople,
            chartData: {
                financial: filtered.reduce((acc: any[], p) => {
                    const idx = acc.findIndex(k => k.name === (p.divisi || "General"));
                    const t = Number(p.targetNominal) || 0;
                    const r = Number(p.realNominal) || 0;
                    if (idx > -1) {
                        acc[idx].Target += t;
                        acc[idx].Realization += r;
                    } else {
                        acc.push({ name: p.divisi || "General", Target: t, Realization: r });
                    }
                    return acc;
                }, [])
            },
            sortedFuturePeople,
            ganttDays,
            ganttData
        };

    }, [isReportGenerated, plans, selectedDivisi, periodType, selectedYear, selectedMonth, selectedWeek, selectedQuarter, selectedSemester, dateRange]);

    // Helper for Avatar
    const getUserImage = (name: string) => {
        if (!users) return null;
        const normalizedName = name.trim().toLowerCase();

        // Try strict match on name
        let user = users.find(u => u.name.toLowerCase().trim() === normalizedName);

        // Try match on first name if no full match
        if (!user) {
            user = users.find(u => u.name.toLowerCase().trim().split(' ')[0] === normalizedName.split(' ')[0]);
        }

        return user?.image;
    };


    const handleGenerate = () => {
        setIsReportGenerated(true);
        setTimeout(() => {
            // Scroll to report
            document.getElementById('report-view')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) {
            toast.error("Tidak dapat menemukan elemen laporan untuk dicetak.");
            return;
        }

        const toastId = toast.loading("Sedang membuat PDF... Mohon tunggu");

        try {
            const htmlToImage = await import('html-to-image');
            const element = reportRef.current;

            // Store original styles to restore later
            const originalOverflow = element.style.overflow;
            const originalWidth = element.style.width;
            const originalMaxWidth = element.style.maxWidth;
            const originalPadding = element.style.padding;

            // Set fixed width for consistent PDF layout (A4 aspect ratio friendly)
            element.style.width = '800px';
            element.style.maxWidth = '800px';
            element.style.overflow = 'visible';
            element.style.padding = '24px';

            // Expand all overflow-x-auto containers and fix Gantt chart width
            const scrollContainers = element.querySelectorAll('.overflow-x-auto');
            const originalContainerStyles: { el: HTMLElement; styles: CSSStyleDeclaration['cssText'] }[] = [];
            scrollContainers.forEach((el: any) => {
                originalContainerStyles.push({
                    el,
                    styles: el.style.cssText
                });
                el.style.overflow = 'visible';
                el.style.width = '100%';
                el.style.maxWidth = '100%';
            });

            // Fix chart containers to have proper dimensions
            const chartContainers = element.querySelectorAll('.recharts-responsive-container');
            const originalChartStyles: { el: HTMLElement; styles: string }[] = [];
            chartContainers.forEach((el: any) => {
                originalChartStyles.push({ el, styles: el.style.cssText });
                el.style.width = '100%';
                el.style.height = '200px';
                el.style.minHeight = '200px';
            });

            // Fix grid layouts to stack properly
            const gridContainers = element.querySelectorAll('.grid');
            const originalGridStyles: { el: HTMLElement; styles: string }[] = [];
            gridContainers.forEach((el: any) => {
                originalGridStyles.push({ el, styles: el.style.cssText });
                // Force single column for narrow PDF
                if (el.classList.contains('grid-cols-2') || el.classList.contains('md:grid-cols-2')) {
                    el.style.display = 'flex';
                    el.style.flexDirection = 'column';
                    el.style.gap = '16px';
                }
            });

            // Wait for any reflows
            await new Promise(resolve => setTimeout(resolve, 800));

            // Use toCanvas for better compatibility
            const canvas = await htmlToImage.toCanvas(element, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                skipFonts: true,
            });

            // Restore original styles
            element.style.overflow = originalOverflow;
            element.style.width = originalWidth;
            element.style.maxWidth = originalMaxWidth;
            element.style.padding = originalPadding;
            originalContainerStyles.forEach(({ el, styles }) => {
                el.style.cssText = styles;
            });
            originalChartStyles.forEach(({ el, styles }) => {
                el.style.cssText = styles;
            });
            originalGridStyles.forEach(({ el, styles }) => {
                el.style.cssText = styles;
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // First page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Subsequent pages
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Laporan_Kerja_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            toast.dismiss(toastId);
            toast.success("PDF berhasil diunduh!");

        } catch (error) {
            console.error("PDF download error:", error);
            toast.dismiss(toastId);
            toast.error("Gagal membuat PDF. Silakan coba lagi.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Reporting Center</h1>
                        <p className="text-xs text-slate-500">Generate Laporan Kinerja Terintegrasi</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* 1. Configuration Panel */}
                <Card className="border-none shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-indigo-500" />
                            Konfigurasi Laporan
                        </CardTitle>
                        <CardDescription>Pilih parameter untuk menghasilkan laporan analisis AI</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Division Select (Dynamic) */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Divisi</label>
                            <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Divisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Divisi</SelectItem>
                                    {uniqueDivisions.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Period Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Tipe Periode</label>
                            <Select value={periodType} onValueChange={(v: PeriodType) => setPeriodType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Mingguan</SelectItem>
                                    <SelectItem value="monthly">Bulanan</SelectItem>
                                    <SelectItem value="quarterly">Triwulan (Quarterly)</SelectItem>
                                    <SelectItem value="semester">Semesteran</SelectItem>
                                    <SelectItem value="yearly">Tahunan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year is almost always needed */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Tahun</label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 8 }, (_, i) => 2023 + i).map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {periodType === 'monthly' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Bulan</label>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()}>
                                                {format(new Date(2024, i, 1), "MMMM", { locale: id })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {periodType === 'weekly' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Minggu Ke- / Tanggal</label>
                                <div className="flex flex-col gap-2">
                                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                                        <SelectTrigger><SelectValue placeholder="Minggu ke..." /></SelectTrigger>
                                        <SelectContent>
                                            {[...Array(53)].map((_, i) => (
                                                <SelectItem key={i} value={(i + 1).toString()}>Minggu {i + 1}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="text-[10px] text-center text-slate-400 font-medium">- ATAU -</div>
                                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                                </div>
                            </div>
                        )}

                        {periodType === 'quarterly' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Triwulan</label>
                                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Q1 (Jan - Mar)</SelectItem>
                                        <SelectItem value="2">Q2 (Apr - Jun)</SelectItem>
                                        <SelectItem value="3">Q3 (Jul - Sep)</SelectItem>
                                        <SelectItem value="4">Q4 (Oct - Dec)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {periodType === 'semester' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Semester</label>
                                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Semester 1 (Jan - Jun)</SelectItem>
                                        <SelectItem value="2">Semester 2 (Jul - Dec)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex items-end">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200"
                                onClick={handleGenerate}
                                disabled={isLoadingPlans}
                            >
                                {isLoadingPlans ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                                Generate Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Report View Area */}
                {isReportGenerated && generatedReport && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="report-view"
                        className="space-y-6"
                    >
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </Button>
                        </div>

                        {/* THE PDF REPORT CONTAINER */}
                        <div className="bg-white p-12 shadow-2xl mx-auto rounded-none max-w-[210mm] min-h-[297mm]" ref={reportRef}>

                            {/* Header */}
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-widest mb-2 font-serif">Laporan Evaluasi Kinerja</h1>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                                        <Building2 className="w-4 h-4" />
                                        <span>{selectedDivisi === 'all' ? 'Seluruh Divisi' : selectedDivisi}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-slate-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block mb-2">
                                        Executive Summary
                                    </div>
                                    <div className="text-sm font-semibold text-slate-700">{generatedReport.periodLabel}</div>
                                </div>
                            </div>

                            {/* Section 1: Strategic Analysis */}
                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <section className="col-span-2 bg-slate-50 p-6 rounded border-l-4 border-indigo-600">
                                    <h2 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Evaluasi Kinerja Makro
                                    </h2>
                                    <p className="text-slate-700 leading-relaxed text-justify text-xs font-sans">
                                        {generatedReport.analysisText}
                                    </p>
                                </section>
                                <section className="bg-orange-50 p-6 rounded border-l-4 border-orange-500">
                                    <h2 className="text-sm font-bold text-orange-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Resiko & Mitigasi
                                    </h2>
                                    <p className="text-slate-800 leading-relaxed text-justify text-xs italic">
                                        "{generatedReport.mitigationText}"
                                    </p>
                                </section>
                            </div>

                            {/* Section: Visual Analytics (Charts) */}
                            <section className="mb-10 grid grid-cols-2 gap-6 page-break-inside-avoid">
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <h3 className="text-xs font-bold text-slate-700 uppercase mb-4 text-center">Distribusi Status</h3>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={generatedReport.statusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {generatedReport.statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <h3 className="text-xs font-bold text-slate-700 uppercase mb-4 text-center">Performansi Finansial</h3>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={generatedReport.chartData.financial}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} />
                                                <YAxis tick={{ fontSize: 8 }} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val} />
                                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                                <Bar dataKey="Target" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Target" />
                                                <Bar dataKey="Realization" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Realisasi" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Division Performance Matrix */}
                            <section className="mb-10">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Evaluasi Per Divisi
                                </h3>
                                <div className="overflow-hidden border rounded-lg">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Divisi</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Kinerja</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Total Misi</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Selesai</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {generatedReport.sortedDivisions.length > 0 ? generatedReport.sortedDivisions.map((div, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-slate-900">{div.name}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-center">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${div.score >= 80 ? 'bg-green-100 text-green-800' :
                                                            div.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {div.score}%
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center text-slate-500">{div.total}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center text-emerald-600 font-bold">{div.completed}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center text-red-600 font-bold">{div.pending}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={5} className="text-center py-4 text-xs">Tidak ada data divisi.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Section 3: Individual Performance Matrix */}
                            <section className="mb-10 page-break-inside-avoid">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <UserCircle className="w-4 h-4" />
                                    Evaluasi Individu (Top PIC)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {generatedReport.sortedPeople.slice(0, 10).map((person, i) => {
                                        const imageUrl = getUserImage(person.name);
                                        const isTopPerformer = person.score > 85;

                                        return (
                                            <div key={i} className={`flex items-center justify-between p-3 border rounded shadow-sm ${isTopPerformer ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {imageUrl ? (
                                                            <img src={imageUrl} alt={person.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                        ) : (
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isTopPerformer ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                                                {person.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        {isTopPerformer && (
                                                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 border border-white">
                                                                <Trophy className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{person.name}</div>
                                                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{person.divisi}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${person.score >= 85 ? 'text-emerald-600' : person.score >= 50 ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                        {person.score}%
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">{person.completed}/{person.total} Tugas</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {generatedReport.sortedPeople.length > 10 && (
                                    <div className="text-center text-xs text-slate-400 mt-2 italic">Menampilkan 10 dari {generatedReport.sortedPeople.length} personel</div>
                                )}
                            </section>

                            <div className="break-inside-avoid-page"></div>

                            {/* Section 3.5: Pending Evaluation Details */}
                            {generatedReport.sortedPendingPeople.length > 0 && (
                                <section className="mb-10 page-break-inside-avoid">
                                    <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wider mb-4 border-b border-orange-200 pb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Evaluasi Pending & Hambatan
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        {generatedReport.sortedPendingPeople.map(([name, items], idx) => {
                                            const imageUrl = getUserImage(name);
                                            return (
                                                <div key={idx} className="bg-orange-50/50 border border-orange-100 rounded-lg p-4">
                                                    <div className="flex items-center gap-3 mb-3 border-b border-orange-100 pb-2">
                                                        <div className="relative">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt={name} className="w-8 h-8 rounded-full object-cover border border-orange-200" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">
                                                                    {name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-800">{name}</div>
                                                            <div className="text-[10px] text-orange-600 font-medium">{items.length} Pending Actions</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {items.map((item, i) => (
                                                            <div key={i} className="bg-white p-3 rounded border border-orange-100 shadow-sm text-xs">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="font-semibold text-slate-800 flex-1 mr-2">{item.lead}</span>
                                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                                        Due: {item.endDate ? format(new Date(item.endDate), 'dd/MM/yy') : '-'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-slate-600 italic bg-slate-50 p-2 rounded mt-1 border border-slate-100">
                                                                    <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Keterangan / Kendala:</span>
                                                                    {item.keterangan || "Tidak ada keterangan."}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </section>
                            )}

                            <div className="break-inside-avoid-page"></div>

                            {/* Section 4: Future Planning (GANTT CHART) */}
                            <section className="mb-8 page-break-inside-avoid">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Rencana Kerja: {generatedReport.futurePeriodLabel}
                                </h3>

                                <div className="border border-slate-200 rounded-lg overflow-hidden flex bg-white shadow-sm">
                                    {/* LEFT PANEL: Fixed Columns (Division / PIC / Plan) */}
                                    <div className="w-[300px] flex-shrink-0 border-r border-slate-200 bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                        <div className="h-12 border-b border-slate-100 flex items-center px-4 bg-slate-50">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Division / PIC / Plan</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {generatedReport.ganttData.map((div, dIdx) => (
                                                <div key={dIdx}>
                                                    {/* Division Row */}
                                                    <div className="h-10 flex items-center px-4 bg-indigo-50/30 gap-2">
                                                        <Folder className="w-3.5 h-3.5 text-indigo-600" />
                                                        <span className="text-xs font-bold text-indigo-900 truncate">{div.name}</span>
                                                    </div>

                                                    {/* Users */}
                                                    {div.users.map((user, uIdx) => {
                                                        const userImage = getUserImage(user.name);
                                                        return (
                                                            <div key={uIdx}>
                                                                {/* User Row */}
                                                                <div className="h-12 flex items-center px-6 gap-3 hover:bg-slate-50">
                                                                    <div className="relative flex-shrink-0">
                                                                        {userImage ? (
                                                                            <img src={userImage} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                                                                        ) : (
                                                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-700">
                                                                                {user.name.substring(0, 1).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs font-medium text-slate-700 truncate">{user.name}</span>
                                                                </div>

                                                                {/* Tasks */}
                                                                {user.tasks.map((task, tIdx) => (
                                                                    <div key={tIdx} className="h-9 flex items-center pl-14 pr-4 gap-2 hover:bg-slate-50">
                                                                        <FileText className="w-3 h-3 text-slate-300" />
                                                                        <span className="text-[10px] text-slate-500 truncate">{task.lead}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* RIGHT PANEL: Scrollable Timeline */}
                                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                                        <div className="min-w-max">
                                            {/* Header Row: Days */}
                                            <div className="h-12 border-b border-slate-100 flex bg-slate-50">
                                                {generatedReport.ganttDays.map((day, i) => (
                                                    <div key={i} className="w-[40px] flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-100 last:border-r-0">
                                                        <span className="text-[10px] font-medium text-slate-400">{format(day, 'EEE')}</span>
                                                        <span className="text-xs font-bold text-slate-700">{format(day, 'd')}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Rows Body */}
                                            <div className="divide-y divide-slate-50 relative">
                                                {/* Grid Background Lines (Optional, simpler to just map cells per row) */}

                                                {generatedReport.ganttData.map((div, dIdx) => (
                                                    <div key={dIdx}>
                                                        {/* Division Row Placeholder */}
                                                        <div className="h-10 border-b border-slate-100/50 bg-indigo-50/10 flex">
                                                            {generatedReport.ganttDays.map((_, i) => (
                                                                <div key={i} className="w-[40px] flex-shrink-0 border-r border-slate-100/50"></div>
                                                            ))}
                                                        </div>

                                                        {/* Users */}
                                                        {div.users.map((user, uIdx) => (
                                                            <div key={uIdx}>
                                                                {/* User Row Bar Placeholder (If we wanted to show user summary) */}
                                                                <div className="h-12 border-b border-slate-100/50 flex bg-slate-50/30">
                                                                    {generatedReport.ganttDays.map((_, i) => (
                                                                        <div key={i} className="w-[40px] flex-shrink-0 border-r border-slate-100/50"></div>
                                                                    ))}
                                                                    {/* Could add a summary bar here if needed */}
                                                                </div>

                                                                {/* Tasks */}
                                                                {user.tasks.map((task, tIdx) => {
                                                                    // Calculate Bar Position and Width
                                                                    let startIndex = -1;
                                                                    let duration = 0;

                                                                    const tStart = task.endDate ? new Date(task.endDate) : null;
                                                                    // Note: Using endDate as start for simplification if startDate missing, or assuming task is 1 day?
                                                                    // Ideally we need startDate. But typical ActionPlan has endDate.
                                                                    // Let's assume startDate is today or start of period if not specified? 
                                                                    // Actually, standard logic: task has start and end dates. 
                                                                    // If only endDate, we show it as a 1-day block or use `startDate` if available.
                                                                    // Looking at schema types, ActionPlan usually has startDate (?), let's check. 
                                                                    // Assuming startDate exists or we use logic. 
                                                                    // If not, we'll try to guess. Let's use `updatedAt` as start? Or just show a 1-day marker.
                                                                    // A safer bet for now is checking if startDate exists (it's in schema usually).
                                                                    // If not, render as single day.

                                                                    // Logic:
                                                                    // Start = Math.max(timelineStart, taskStart)
                                                                    // End = Math.min(timelineEnd, taskEnd)

                                                                    const tEnd = tStart; // Default to single day

                                                                    if (tStart) {
                                                                        // Find index in ganttDays
                                                                        const startDayIndex = generatedReport.ganttDays.findIndex(d => isSameDay(d, tStart));

                                                                        if (startDayIndex !== -1) {
                                                                            startIndex = startDayIndex;
                                                                            duration = 1; // Default 1 day width
                                                                        }
                                                                    }

                                                                    return (
                                                                        <div key={tIdx} className="h-9 border-b border-slate-100/50 flex relative">
                                                                            {/* Grid Cells */}
                                                                            {generatedReport.ganttDays.map((_, i) => (
                                                                                <div key={i} className="w-[40px] flex-shrink-0 border-r border-slate-100/50"></div>
                                                                            ))}

                                                                            {startIndex !== -1 && (
                                                                                <div
                                                                                    className="absolute top-1.5 bottom-1.5 bg-orange-200/80 border border-orange-300/50 rounded flex items-center px-2 shadow-sm"
                                                                                    style={{
                                                                                        left: `${startIndex * 40}px`,
                                                                                        width: `${Math.max(duration, 1) * 40}px`
                                                                                    }}
                                                                                >
                                                                                    {/* Hover Tooltip trigger could be here */}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>


                            {/* Footer */}
                            <div className="mt-auto flex justify-between items-end pt-8 border-t border-slate-200">
                                <div className="text-xs text-slate-400">
                                    System-Generated Detailed Report  •  {format(new Date(), "dd/MM/yyyy HH:mm")}
                                </div>
                                <div className="text-center w-40">
                                    <div className="h-16 border-b border-slate-300 mb-2"></div>
                                    <div className="text-xs font-bold uppercase text-slate-700">Diketahui Oleh</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

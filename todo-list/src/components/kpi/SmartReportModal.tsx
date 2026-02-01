import React, { useState, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Loader2, Calendar, Layers, AlertTriangle, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { ActionPlan } from "@/types/action-plan";

interface SmartReportModalProps {
    plans: ActionPlan[];
    dateFrom?: Date;
    dateTo?: Date;
}

type PeriodType = 'dashboard' | 'weekly' | 'monthly' | 'quarterly' | 'semester' | 'yearly';

export function SmartReportModal({ plans, dateFrom, dateTo }: SmartReportModalProps) {
    const [period, setPeriod] = useState<PeriodType>(dateFrom && dateTo ? 'dashboard' : 'monthly');
    const [isGenerating, setIsGenerating] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    // Filter Logic
    const filteredData = useMemo(() => {
        const now = new Date();
        let start: Date;
        let end: Date;

        switch (period) {
            case 'dashboard':
                start = dateFrom ? new Date(dateFrom) : startOfMonth(now);
                end = dateTo ? new Date(dateTo) : endOfMonth(now);
                break;
            case 'weekly':
                start = startOfWeek(now, { weekStartsOn: 1 });
                end = endOfWeek(now, { weekStartsOn: 1 });
                break;
            case 'monthly':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            case 'quarterly':
                start = startOfQuarter(now);
                end = endOfQuarter(now);
                break;
            case 'semester':
                const currentMonth = now.getMonth();
                if (currentMonth < 6) {
                    start = startOfYear(now);
                    end = endOfMonth(new Date(now.getFullYear(), 5, 30));
                } else {
                    start = startOfMonth(new Date(now.getFullYear(), 6, 1));
                    end = endOfYear(now);
                }
                break;
            case 'yearly':
                start = startOfYear(now);
                end = endOfYear(now);
                break;
            default:
                start = startOfMonth(now);
                end = endOfMonth(now);
        }

        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        return plans.filter(p => {
            if (!p.endDate) return false;
            const planDate = new Date(p.endDate);
            if (isNaN(planDate.getTime())) return false;
            return planDate >= startDate && planDate <= endDate;
        });
    }, [plans, period, dateFrom, dateTo]);

    // Advanced Metrics & Narrative Engine
    const reportData = useMemo(() => {
        if (filteredData.length === 0) return null;

        let completedCount = 0;
        let pendingCount = 0;
        let tTarget = 0;
        let tReal = 0;
        const deptPerformance: Record<string, { total: number, completed: number, pending: number }> = {};

        filteredData.forEach(p => {
            const t = Number(p.targetNominal) || 0;
            const r = Number(p.realNominal) || 0;
            const isDone = (p.status?.toLowerCase().includes('done')) || (t > 0 && r >= t);

            tTarget += t;
            tReal += r;

            const dept = p.divisi || p.department || "General";
            if (!deptPerformance[dept]) deptPerformance[dept] = { total: 0, completed: 0, pending: 0 };
            deptPerformance[dept].total++;

            if (isDone) {
                completedCount++;
                deptPerformance[dept].completed++;
            } else {
                pendingCount++;
                deptPerformance[dept].pending++;
            }
        });

        const completionRate = Math.round((completedCount / filteredData.length) * 100);
        const budgetEfficiency = tTarget > 0 ? Math.round((tReal / tTarget) * 100) : 0;

        // Strategic Analysis
        let topDept = { name: "-", rate: 0 };
        let bottleneckDept = { name: "-", count: 0 };

        Object.entries(deptPerformance).forEach(([name, stats]) => {
            const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            if (rate > topDept.rate) topDept = { name, rate };
            if (stats.pending > bottleneckDept.count) bottleneckDept = { name, count: stats.pending };
        });

        // Narrative Generation
        const periodText = period === 'dashboard' ? 'Terkustomisasi' : period;

        const executiveSummary = `Laporan kinerja periode ${periodText} ini menunjukkan total ${filteredData.length} inisiatif strategis. Organisasi mencapai tingkat penyelesaian ${completionRate}%, dengan realisasi nilai ekonomi sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tReal)}.`;

        const budgetStatus = tReal <= tTarget
            ? "Penggunaan anggaran tercatat EFISIEN di bawah pagu yang ditetapkan."
            : "Realisasi anggaran MELEBIHI target, memerlukan evaluasi pos pengeluaran.";

        const strategicRecommendation = completionRate < 50
            ? `Diperlukan intervensi segera pada divisi '${bottleneckDept.name}' yang memiliki ${bottleneckDept.count} item tertunda. Prioritaskan realokasi sumber daya untuk mengejar backlog.`
            : `Kinerja solid ditunjukkan oleh '${topDept.name}'. Disarankan untuk menduplikasi kerangka kerja divisi ini ke unit lain untuk standarisasi operasional.`;

        return {
            totalPlans: filteredData.length,
            completed: completedCount,
            pending: pendingCount,
            completionRate,
            totalTarget: tTarget,
            totalRealization: tReal,
            budgetEfficiency,
            executiveSummary,
            budgetStatus,
            strategicRecommendation,
            topDept: topDept.name,
            bottleneckDept: bottleneckDept.name
        };
    }, [filteredData, period]);

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsGenerating(true);
        const toastId = toast.loading("Menyiapkan dokumen profesional...");

        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

            toast.success("Dokumen berhasil diterbitkan!", { id: toastId });
        } catch (error) {
            console.error("PDF Error", error);
            toast.error("Gagal menerbitkan dokumen.", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm font-medium">
                    <FileText className="w-4 h-4" />
                    Executive Report
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[1000px] h-[90vh] p-0 overflow-hidden flex flex-col bg-slate-50/50 backdrop-blur-sm">

                {/* Control Bar */}
                <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-semibold text-slate-800">Smart Report Generator</DialogTitle>
                            <p className="text-xs text-slate-500">Professional KPI Analysis Engine</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={period} onValueChange={(v: PeriodType) => setPeriod(v)}>
                            <SelectTrigger className="w-[180px] h-9 text-xs">
                                <SelectValue placeholder="Select Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dashboard">Dashboard Filter</SelectItem>
                                <SelectItem value="monthly">Monthly Report</SelectItem>
                                <SelectItem value="quarterly">Quarterly Review</SelectItem>
                                <SelectItem value="yearly">Annual Report</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleDownloadPDF} disabled={isGenerating || !reportData} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Scrollable Preview Area */}
                <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100">

                    {!reportData ? (
                        <div className="flex flex-col items-center justify-center h-full text-center max-w-md">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                <Calendar className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Tidak Ada Data Signifikan</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Periode yang dipilih tidak memiliki data kinerja yang cukup untuk dianalisis.
                                Silakan pilih rentang tanggal lain atau gunakan filter Dashboard.
                            </p>
                        </div>
                    ) : (
                        // A4 PAPER UI
                        <div
                            ref={reportRef}
                            className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-12 relative text-slate-900 font-sans"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} // Serif for that premium doc feel
                        >
                            {/* Document Header */}
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wider mb-2">Laporan Kinerja Eksekutif</h1>
                                    <p className="text-sm text-slate-500 font-sans">Divisi Perencanaan Strategis & Evaluasi Kinerja</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">DOKUMEN RAHASIA</div>
                                    <div className="text-sm font-medium text-slate-900">{format(new Date(), 'dd MMMM yyyy', { locale: id })}</div>
                                </div>
                            </div>

                            {/* Executive Summary Section */}
                            <section className="mb-10">
                                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-3 border-l-4 border-indigo-600 pl-3 font-sans">
                                    Ringkasan Eksekutif
                                </h3>
                                <p className="text-base text-slate-700 leading-relaxed text-justify">
                                    {reportData.executiveSummary} {reportData.budgetStatus} Secara keseluruhan, stabilitas operasional terjaga dengan baik.
                                </p>
                            </section>

                            {/* KPI Grid */}
                            <section className="mb-10">
                                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-3 font-sans">
                                    Metrik Kunci (Key Performance Indicators)
                                </h3>
                                <div className="grid grid-cols-3 gap-6 font-sans">
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                                        <div className="text-xs text-slate-500 uppercase font-semibold">Tingkat Penyelesaian</div>
                                        <div className="text-3xl font-bold text-slate-900 mt-2">{reportData.completionRate}%</div>
                                        <div className="text-xs text-slate-400 mt-1">{reportData.completed} dari {reportData.totalPlans} Selesai</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                                        <div className="text-xs text-slate-500 uppercase font-semibold">Efisiensi Anggaran</div>
                                        <div className="text-3xl font-bold text-slate-900 mt-2">{reportData.budgetEfficiency}%</div>
                                        <div className="text-xs text-slate-400 mt-1">Target vs Realisasi</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                                        <div className="text-xs text-slate-500 uppercase font-semibold">Total Realisasi</div>
                                        <div className="text-xl font-bold text-slate-900 mt-3 truncate">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(reportData.totalRealization)}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Strategic Insights */}
                            <section className="mb-10">
                                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-3 border-l-4 border-indigo-600 pl-3 font-sans">
                                    Rekomendasi Strategis
                                </h3>
                                <div className="bg-orange-50/50 border-l-4 border-orange-400 p-4 mb-4">
                                    <h4 className="text-sm font-bold text-orange-900 font-sans mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Area Perhatian: {reportData.bottleneckDept}
                                    </h4>
                                    <p className="text-sm text-orange-800 leading-relaxed italic">
                                        "{reportData.strategicRecommendation}"
                                    </p>
                                </div>
                                <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-4">
                                    <h4 className="text-sm font-bold text-emerald-900 font-sans mb-1 flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Top Performer: {reportData.topDept}
                                    </h4>
                                    <p className="text-sm text-emerald-800 leading-relaxed">
                                        Unit ini menunjukkan konsistensi tinggi dalam eksekusi rencana. Dapat dijadikan model percontohan operasional.
                                    </p>
                                </div>
                            </section>

                            {/* Detailed Table */}
                            <section className="mb-12 flex-1">
                                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-3 font-sans">
                                    Lampiran Data (Sampel Strategis)
                                </h3>
                                <table className="w-full text-xs text-left border-collapse font-sans">
                                    <thead>
                                        <tr className="border-b-2 border-slate-800">
                                            <th className="py-2 font-bold text-slate-900 uppercase">Rencana Aksi</th>
                                            <th className="py-2 font-bold text-slate-900 uppercase">Unit</th>
                                            <th className="py-2 font-bold text-slate-900 uppercase text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.slice(0, 8).map((p, idx) => (
                                            <tr key={idx} className="border-b border-slate-200">
                                                <td className="py-3 px-1 text-slate-700 font-medium max-w-[300px]">{p.lead}</td>
                                                <td className="py-3 px-1 text-slate-500">{p.divisi || p.department}</td>
                                                <td className="py-3 px-1 text-center">
                                                    {p.status?.includes('Done') ? (
                                                        <span className="text-emerald-700 font-bold">SELESAI</span>
                                                    ) : (
                                                        <span className="text-amber-600 font-bold">PROSES</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            {/* Footer / Sign-off */}
                            <div className="mt-auto pt-12 flex justify-between items-end font-sans">
                                <div className="text-xs text-slate-400">
                                    <div>Generated by Todo List KPI System v2.0</div>
                                    <div>Verification ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                                </div>
                                <div className="text-center">
                                    <div className="h-16 mb-2 border-b border-slate-300 w-48"></div>
                                    <div className="text-xs font-bold text-slate-900 uppercase">Disetujui Oleh</div>
                                    <div className="text-[10px] text-slate-500">Tanda Tangan & Cap Digital</div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default SmartReportModal;

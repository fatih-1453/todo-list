"use client"

import * as React from "react"
import { X, Upload, Loader2, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

interface UploadActionPlanModalProps {
    isOpen: boolean
    onClose: () => void
}

export function UploadActionPlanModal({ isOpen, onClose }: UploadActionPlanModalProps) {
    const queryClient = useQueryClient()
    const [file, setFile] = React.useState<File | null>(null)
    const [previewData, setPreviewData] = React.useState<any[]>([])
    const [error, setError] = React.useState<string | null>(null)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [uploadStats, setUploadStats] = React.useState<{ total: number, uploaded: number, skipped: number } | null>(null)

    // Reset state on close
    React.useEffect(() => {
        if (!isOpen) {
            setFile(null)
            setPreviewData([])
            setError(null)
            setIsSuccess(false)
            setUploadStats(null)
        }
    }, [isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
            setError("Please upload a valid Excel file (.xlsx or .xls)")
            return
        }

        setFile(selectedFile)
        setError(null)
        parseExcel(selectedFile)
    }

    const parseExcel = async (file: File) => {
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            // Read as Array of Arrays to handle complex headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

            // Basic validation
            if (jsonData.length === 0) {
                setError("The Excel file appears to be empty.")
                setFile(null)
                return
            }

            // Find the header row
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                const rowStr = JSON.stringify(jsonData[i] || []).toLowerCase();
                if (rowStr.includes("plan") || rowStr.includes("program")) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                setError("Could not find header row. Please check the template.")
                setFile(null)
                return
            }

            const dataStartIndex = headerRowIndex + 1;

            const processRow = (row: any[]) => {
                // Mapping based on Template:
                // 0: Nama, 1: Plan, 2: Program, ... 13: Divisi
                return {
                    pic: row[0] || '',
                    plan: row[1] || 'No Plan',
                    program: row[2] || '',
                    div: row[13] || '',
                };
            };

            const rawData = jsonData.slice(dataStartIndex);
            const mappedData = rawData
                .map(processRow)
                .filter(item => item.plan !== 'No Plan' && item.plan !== '');

            setPreviewData(mappedData.slice(0, 5));
        } catch (err) {
            console.error("Excel parse error:", err)
            setError("Failed to parse Excel file. Please check the format.")
            setFile(null)
        }
    }



    const uploadMutation = useMutation({
        mutationFn: async () => {
            const data = await file!.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

            // Find header row: Look for "Plan" or "Program" or "Nama"
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                const rowStr = JSON.stringify(jsonData[i] || []).toLowerCase();
                if (rowStr.includes("plan") || rowStr.includes("program")) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) throw new Error("Header not found. Please use the downloaded template.");

            // Data starts immediately after header in the new template
            const dataStartIndex = headerRowIndex + 1;


            const safeNum = (val: any) => {
                if (typeof val === 'string') val = val.replace(/,/g, '');
                const num = Number(val);
                return isNaN(num) ? 0 : num;
            };

            const parseDate = (val: any) => {
                if (!val) return undefined;
                if (typeof val === 'number') {
                    return new Date(Math.round((val - 25569) * 86400 * 1000)).toISOString();
                }
                if (typeof val === 'string') {
                    // Try YYYY-MM-DD
                    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return new Date(val).toISOString();
                    // Try DD/MM/YYYY
                    if (val.includes('/')) {
                        const parts = val.split('/');
                        if (parts.length === 3) {
                            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).toISOString();
                        }
                    }
                }
                const d = new Date(val);
                return !isNaN(d.getTime()) ? d.toISOString() : undefined;
            };

            // Dynamic Header Mapping
            const headers = (jsonData[headerRowIndex] as string[]).map(h => String(h).toLowerCase().trim());

            const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

            const map = {
                pic: getIdx(['nama', 'pic', 'person']),
                lead: getIdx(['plan', 'lead', 'activity', 'kegiatan']),
                program: getIdx(['program']),
                output: getIdx(['output']),
                keterangan: getIdx(['keterangan', 'catatan', 'notes']),
                indikator: getIdx(['indikator']),
                lokasi: getIdx(['lokasi', 'location']),
                startDate: getIdx(['start', 'mulai']),
                endDate: getIdx(['end', 'selesai']),
                targetActivity: getIdx(['target kegiatan', 'target activity']),
                targetReceiver: getIdx(['target penerima', 'receiver']),
                goal: getIdx(['tujuan', 'goal']),
                position: getIdx(['jabatan', 'position']),
                subdivisi: getIdx(['subdivisi', 'subdivision']),
                divisi: getIdx(['divisi', 'division']),
                executingAgency: getIdx(['biro', 'pelaksana', 'agency']),
                classification: getIdx(['klasifikasi', 'class']),
                realActivity: getIdx(['realisasi kegiatan', 'real activity']),
                status: getIdx(['status', 'real week'])
            };

            // Helper to get cell value
            const getVal = (row: any[], idx: number) => idx !== -1 ? row[idx] : undefined;

            const processRow = (row: any[]) => {
                if (!row || row.length === 0) return null;

                return {
                    pic: getVal(row, map.pic) || '',
                    lead: getVal(row, map.lead) || 'No Plan',
                    program: getVal(row, map.program) || '',
                    output: getVal(row, map.output) || '',
                    keterangan: getVal(row, map.keterangan) || '',
                    indikator: getVal(row, map.indikator) || '',
                    lokasi: getVal(row, map.lokasi) || '',
                    startDate: parseDate(getVal(row, map.startDate)),
                    endDate: parseDate(getVal(row, map.endDate)),
                    targetActivity: safeNum(getVal(row, map.targetActivity)),
                    targetReceiver: getVal(row, map.targetReceiver) || '',
                    goal: getVal(row, map.goal) || '',
                    position: getVal(row, map.position) || '',
                    subdivisi: getVal(row, map.subdivisi) || '',
                    divisi: getVal(row, map.divisi) || '',
                    executingAgency: getVal(row, map.executingAgency) || '',
                    classification: getVal(row, map.classification) || '',

                    realActivity: safeNum(getVal(row, map.realActivity)) || 0,
                    status: getVal(row, map.status) || 'Pending'
                };
            };

            const rawData = jsonData.slice(dataStartIndex);
            const processedData = rawData.map(processRow);
            const payload = processedData.filter(item => item && item.lead !== 'No Plan' && item.lead !== '');

            const stats = {
                total: rawData.length,
                uploaded: payload.length,
                skipped: rawData.length - payload.length
            };

            await apiClient.post('/action-plans/bulk', payload)
            return stats;
        },
        onSuccess: (stats) => {
            queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
            setUploadStats(stats)
            setIsSuccess(true)
            toast.success("Action plans processed")
        },
        onError: (err) => {
            console.error(err)
            setError("Failed to upload. " + (err instanceof Error ? err.message : "Please check your file."))
        }
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="font-bold text-lg text-gray-900">Upload Action Plan</h2>
                        <p className="text-sm text-gray-500">Import your 4DX Excel file</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {!file && !isSuccess && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="font-medium text-gray-900">Click to upload or drag and drop</h3>
                            <p className="text-sm text-gray-500 mt-1">Excel files (.xlsx) only</p>
                        </div>
                    )}

                    {file && !isSuccess && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {previewData.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview (First 5 Rows)</h4>
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Nama</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Plan</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Program</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Divisi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {previewData.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2 text-gray-900">{row.pic}</td>
                                                        <td className="px-3 py-2 text-gray-900 max-w-[150px] truncate">{row.plan}</td>
                                                        <td className="px-3 py-2 text-gray-900 max-w-[150px] truncate">{row.program}</td>
                                                        <td className="px-3 py-2 text-gray-900">{row.div}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-center text-gray-400 mt-2">...and more</p>
                                </div>
                            )}
                        </div>
                    )}

                    {isSuccess && (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900">Import Successful!</h3>

                            {uploadStats ? (
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 w-full max-w-sm">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase">Total Rows</p>
                                            <p className="text-lg font-bold text-gray-900">{uploadStats.total}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-600 font-medium uppercase">Success</p>
                                            <p className="text-lg font-bold text-green-600">{uploadStats.uploaded}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-orange-500 font-medium uppercase">Skipped</p>
                                            <p className="text-lg font-bold text-orange-500">{uploadStats.skipped}</p>
                                        </div>
                                    </div>
                                    {uploadStats.skipped > 0 && (
                                        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                                            {uploadStats.skipped} rows were skipped because they had missing 'Plan' or empty data.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 mt-1">Your action plans have been added.</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isSuccess && (
                    <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => uploadMutation.mutate()}
                            disabled={!file || uploadMutation.isPending}
                            className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Import Data
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

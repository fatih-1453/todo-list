"use client"

import * as React from "react"
import { X, Upload, Loader2, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
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

    // Reset state on close
    React.useEffect(() => {
        if (!isOpen) {
            setFile(null)
            setPreviewData([])
            setError(null)
            setIsSuccess(false)
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

            // Find the header row (look for "DIV" and "WIG" specifically to avoid matching Title row)
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                const rowStr = JSON.stringify(jsonData[i] || []).toLowerCase();
                if (rowStr.includes("div") && rowStr.includes("wig")) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                setError("Could not find header row (DIV, Action Plan, etc). Please check the template.")
                setFile(null)
                return
            }

            // Data starts 2 rows after main header (Title Row -> Header Row -> SubHeader Row -> Data)
            // Actually in the image: 
            // Row 1: ACTION PLAN (Title)
            // Row 2: Headers (DIV... )
            // Row 3: SubHeaders (Pekan 1...)
            // Row 4: Data
            // So if Header found at index 1 (Row 2), Data starts at index 3 (Row 4).
            // Distance is +2.
            // Dynamic check for data start index
            let dataStartIndex = headerRowIndex + 1;
            const nextRow = jsonData[headerRowIndex + 1];
            if (nextRow) {
                const rowStr = JSON.stringify(nextRow).toLowerCase();
                if (rowStr.includes("pekan") || rowStr.includes("week") || rowStr.includes("evaluasi") || rowStr.includes("realisasi")) {
                    dataStartIndex = headerRowIndex + 2;
                }
            }

            // Fill Down State for Preview
            let lastDiv = '';
            let lastDept = ''; // Add other cached fields if displaying in preview

            const processRow = (row: any[]) => {
                // Safety helper: ensure number, default to 0 if NaN
                const safeNum = (val: any) => {
                    const num = Number(val);
                    return isNaN(num) ? 0 : num;
                };

                // Helper to parse date (Excel serial or string)
                const parseDate = (val: any) => {
                    if (!val) return undefined;
                    if (typeof val === 'number') {
                        // Excel serial date
                        return new Date(Math.round((val - 25569) * 86400 * 1000));
                    }
                    if (typeof val === 'string' && val.includes('/')) {
                        const parts = val.split('/');
                        if (parts.length === 3) {
                            // Assume DD/MM/YY
                            const day = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1;
                            let year = parseInt(parts[2]);
                            if (year < 100) year += 2000;
                            const d = new Date(year, month, day);
                            if (!isNaN(d.getTime())) return d;
                        }
                    }
                    const d = new Date(val);
                    return !isNaN(d.getTime()) ? d : undefined;
                };

                // Fill Down Logic for Preview
                const currentDiv = row[0] ? String(row[0]) : '';
                const currentDept = row[5] ? String(row[5]) : '';

                if (currentDiv) lastDiv = currentDiv;
                if (currentDept) lastDept = currentDept;

                return {
                    div: lastDiv, // Use filled val
                    wig: row[1] || '',
                    lag: row[2] || '',
                    lead: row[3] || '',
                    plan: row[4] || 'No Plan',
                    department: lastDept,
                    startDate: parseDate(row[6]),
                    targetActivity: safeNum(row[7]),
                    targetNominal: safeNum(row[8]),

                    evalWeek1: safeNum(row[9]),
                    evalWeek2: safeNum(row[10]),
                    evalWeek3: safeNum(row[11]),
                    evalWeek4: safeNum(row[12]),

                    realWeek1: safeNum(row[13]),
                    // realWeek2,3,4 removed

                    notes: row[14] ? String(row[14]) : '', // New Notes column

                    pic: row[15] || '',
                    risk: row[16] || '',
                };
            };

            const rawData = jsonData.slice(dataStartIndex);
            const mappedData = rawData
                .map(processRow)
                .filter(item => item.plan !== 'No Plan' && item.plan !== ''); // Filter empty

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

            // Re-find header (same strict logic)
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                const rowStr = JSON.stringify(jsonData[i] || []).toLowerCase();
                if (rowStr.includes("div") && rowStr.includes("wig")) {
                    headerRowIndex = i;
                    break;
                }
            }
            if (headerRowIndex === -1) throw new Error("Header not found");
            // Dynamic check for data start index
            // Check row after header. If it looks like data (has "Draft" or valid 4DX terms), assume data starts there.
            // If it has "Pekan", "Week", "Evaluasi", assume it's a sub-header.
            let dataStartIndex = headerRowIndex + 1;
            const nextRow = jsonData[headerRowIndex + 1];
            if (nextRow) {
                const rowStr = JSON.stringify(nextRow).toLowerCase();
                if (rowStr.includes("pekan") || rowStr.includes("week") || rowStr.includes("evaluasi") || rowStr.includes("realisasi")) {
                    dataStartIndex = headerRowIndex + 2;
                }
            }

            // Fill Down State
            let lastDiv = '';
            let lastWig = '';
            let lastLag = '';
            let lastLead = '';
            let lastDept = '';

            const processRow = (row: any[]) => {
                const safeNum = (val: any) => {
                    if (typeof val === 'string') {
                        // Handle numbers with thousands separators if needed, though usually Excel has raw numbers
                        val = val.replace(/,/g, '');
                    }
                    const num = Number(val);
                    return isNaN(num) ? 0 : num;
                };

                const parseDate = (val: any) => {
                    if (!val) return undefined;
                    if (typeof val === 'number') {
                        return new Date(Math.round((val - 25569) * 86400 * 1000)).toISOString();
                    }
                    // Handle "DD/MM/YY" manually if standard parse fails or assumes US
                    if (typeof val === 'string' && val.includes('/')) {
                        const parts = val.split('/');
                        if (parts.length === 3) {
                            // Assume DD/MM/YY for ID locale
                            const day = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1; // 0-indexed
                            let year = parseInt(parts[2]);
                            if (year < 100) year += 2000;
                            const d = new Date(year, month, day);
                            if (!isNaN(d.getTime())) return d.toISOString();
                        }
                    }
                    const d = new Date(val);
                    return !isNaN(d.getTime()) ? d.toISOString() : undefined;
                };

                // Fill Down Logic
                const currentDiv = row[0] ? String(row[0]) : '';
                const currentWig = row[1] ? String(row[1]) : '';
                const currentLag = row[2] ? String(row[2]) : '';
                const currentLead = row[3] ? String(row[3]) : '';
                const currentDept = row[5] ? String(row[5]) : ''; // Department at index 5

                if (currentDiv) lastDiv = currentDiv;
                if (currentWig) lastWig = currentWig;
                if (currentLag) lastLag = currentLag;
                if (currentLead) lastLead = currentLead;
                if (currentDept) lastDept = currentDept;

                return {
                    div: lastDiv,
                    wig: lastWig,
                    lag: lastLag,
                    lead: lastLead,
                    plan: row[4] || 'No Plan',
                    department: lastDept,
                    startDate: parseDate(row[6]),
                    targetActivity: safeNum(row[7]),
                    targetNominal: safeNum(row[8]),

                    evalWeek1: safeNum(row[9]),
                    evalWeek2: safeNum(row[10]),
                    evalWeek3: safeNum(row[11]),
                    evalWeek4: safeNum(row[12]),

                    realWeek1: row[13] ? String(row[13]) : '',
                    realNominal: safeNum(row[14]),

                    notes: row[15] ? String(row[15]) : '',

                    pic: row[16] || '',
                    risk: row[17] || '',
                };
            };

            // Use simple for loop to maintain state or map with external state
            // map is fine since it processes in order
            const payload = jsonData.slice(dataStartIndex)
                .map(processRow)
                .filter(item => item.plan !== 'No Plan' && item.plan !== '');

            return apiClient.post('/action-plans/bulk', payload)
        },
        onSuccess: () => {
            setIsSuccess(true)
            queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
            setTimeout(() => {
                onClose()
            }, 1500)
        },
        onError: (err) => {
            setError("Failed to upload. Please try again.")
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
                                                    <th className="px-3 py-2 text-left font-medium text-gray-500">DIV</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Action Plan</th>
                                                    <th className="px-3 py-2 text-left font-medium text-gray-500">PIC</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {previewData.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2 text-gray-900">{row.div}</td>
                                                        <td className="px-3 py-2 text-gray-900 max-w-[200px] truncate">{row.plan}</td>
                                                        <td className="px-3 py-2 text-gray-900">{row.pic}</td>
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
                            <p className="text-gray-500 mt-1">Your action plans have been added.</p>
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

"use client"

import * as React from "react"
import { X, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { StatusDropdown } from "./StatusDropdown"

interface CreateActionPlanModalProps {
    isOpen: boolean
    onClose: () => void
    initialData?: any // Optional: if provided, we are in Edit mode
}

export function CreateActionPlanModal({ isOpen, onClose, initialData }: CreateActionPlanModalProps) {
    const queryClient = useQueryClient()
    const isEditing = !!initialData

    const [formData, setFormData] = React.useState({
        // Core
        pic: "", // Nama
        plan: "", // Lead
        program: "",
        notes: "", // Catatan

        // Context/Details
        indikator: "",
        lokasi: "",

        // Dates
        startDate: "",
        endDate: "",

        // Metrics
        targetActivity: 0,
        realActivity: 0, // Realisasi Kegiatan
        realWeek1: "", // Status

        // Organization / Meta
        targetReceiver: "",
        goal: "", // Tujuan
        position: "", // Jabatan
        subdivisi: "",
        div: "", // Divisi
        executingAgency: "", // Div Pelaksana
        classification: ""
    })

    // Reset or Fill on open
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Populate form for editing
                setFormData({
                    pic: initialData.pic || "",
                    plan: initialData.plan || "",
                    program: initialData.program || "",
                    notes: initialData.notes || "",
                    indikator: initialData.indikator || "",
                    lokasi: initialData.lokasi || "",
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
                    targetActivity: initialData.targetActivity || 0,
                    realActivity: initialData.realActivity || 0,
                    realWeek1: initialData.realWeek1 || "",
                    targetReceiver: initialData.targetReceiver || "",
                    goal: initialData.goal || "",
                    position: initialData.position || "",
                    subdivisi: initialData.subdivisi || "",
                    div: initialData.div || "",
                    executingAgency: initialData.executingAgency || "",
                    classification: initialData.classification || ""
                })
            } else {
                // Reset for create
                setFormData({
                    pic: "",
                    plan: "",
                    program: "",
                    notes: "",
                    indikator: "",
                    lokasi: "",
                    startDate: "",
                    endDate: "",
                    targetActivity: 0,
                    realActivity: 0,
                    realWeek1: "",
                    targetReceiver: "",
                    goal: "",
                    position: "",
                    subdivisi: "",
                    div: "",
                    executingAgency: "",
                    classification: ""
                })
            }
        }
    }, [isOpen, initialData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const mutation = useMutation({
        mutationFn: async () => {
            // Helper for safe number parsing
            const parseNum = (val: any) => {
                if (!val) return 0;
                const num = Number(val);
                return isNaN(num) ? 0 : num;
            };

            const payload = {
                // Maps directly to backend fields
                ...formData,
                targetActivity: Math.floor(parseNum(formData.targetActivity)),
                realActivity: Math.floor(parseNum(formData.realActivity)),
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            }

            console.log("Submitting payload:", payload);

            if (isEditing) {
                if (!initialData.id) throw new Error("Missing ID for update");
                return apiClient.put(`/action-plans/${initialData.id}`, payload)
            } else {
                return apiClient.post('/action-plans', payload)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actionPlans'] })
            toast.success("Action plan saved successfully")
            onClose()
        },
        onError: (error: any) => {
            console.error("Mutation failed:", error);
            const msg = error.response?.data?.error || error.message;
            toast.error(`Failed to save plan: ${msg}`)
        }
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-900">{isEditing ? "Edit Action Plan" : "New Action Plan"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Row 1: Identification */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Nama (PIC)</label>
                            <input name="pic" value={formData.pic} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Nama PIC..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Jabatan</label>
                            <input name="position" value={formData.position} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Jabatan..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Divisi</label>
                            <input name="div" value={formData.div} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Divisi..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Subdivisi</label>
                            <input name="subdivisi" value={formData.subdivisi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Div Pelaksana</label>
                            <input name="executingAgency" value={formData.executingAgency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                    </div>

                    {/* Row 2: Core Plan */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Lead (Activity Name)</label>
                        <textarea name="plan" value={formData.plan} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none resize-none h-20" placeholder="Activity name..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Program</label>
                            <input name="program" value={formData.program} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Program name..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Tujuan (Goal)</label>
                            <input name="goal" value={formData.goal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Goal..." />
                        </div>
                    </div>

                    {/* Row 3: Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Indikator</label>
                            <input name="indikator" value={formData.indikator} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Lokasi</label>
                            <input name="lokasi" value={formData.lokasi} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                    </div>

                    {/* Row 4: Dates & Class */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Klasifikasi</label>
                            <input name="classification" value={formData.classification} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                    </div>

                    {/* Row 5: Metrics & Status */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Target Kegiatan</label>
                            <input type="number" name="targetActivity" value={formData.targetActivity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Realisasi Kegiatan</label>
                            <input type="number" name="realActivity" value={formData.realActivity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                            <StatusDropdown
                                value={formData.realWeek1}
                                onChange={(val) => setFormData(prev => ({ ...prev, realWeek1: val }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Target Penerima</label>
                            <input name="targetReceiver" value={formData.targetReceiver} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Catatan</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none resize-none h-20" placeholder="Notes..." />
                    </div>

                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditing ? "Update Plan" : "Save Plan"}
                    </button>
                </div>
            </div>
        </div>
    )
}

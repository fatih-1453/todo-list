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
        div: "",
        wig: "",
        lag: "",
        lead: "",
        plan: "",
        department: "",
        pic: "",
        startDate: "",
        targetActivity: 0,
        targetNominal: 0,
        risk: "",
        realWeek1: "",
        notes: "",
        realNominal: 0
    })

    // Reset or Fill on open
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Populate form for editing
                setFormData({
                    div: initialData.div || "",
                    wig: initialData.wig || "",
                    lag: initialData.lag || "",
                    lead: initialData.lead || "",
                    plan: initialData.plan || "",
                    department: initialData.department || "",
                    pic: initialData.pic || "",
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
                    targetActivity: initialData.targetActivity || 0,
                    targetNominal: initialData.targetNominal || 0,
                    realNominal: initialData.realNominal || 0, // New Field
                    risk: initialData.risk || "",
                    realWeek1: initialData.realWeek1 || "",
                    notes: initialData.notes || ""
                })
            } else {
                // Reset for create
                setFormData({
                    div: "",
                    wig: "",
                    lag: "",
                    lead: "",
                    plan: "",
                    department: "",
                    pic: "",
                    startDate: "",
                    targetActivity: 0,
                    targetNominal: 0,
                    realNominal: 0, // New Field
                    risk: "",
                    realWeek1: "",
                    notes: ""
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
                div: formData.div,
                wig: formData.wig,
                lag: formData.lag,
                lead: formData.lead,
                plan: formData.plan,
                department: formData.department,
                pic: formData.pic,
                risk: formData.risk,
                targetActivity: Math.floor(parseNum(formData.targetActivity)), // Ensure Integer
                // Fix: directly use string for decimal to avoid precision or format issues (Drizzle expects string/number)
                targetNominal: formData.targetNominal ? String(formData.targetNominal) : '0',
                realNominal: formData.realNominal ? String(formData.realNominal) : '0', // New Field
                realWeek1: formData.realWeek1,
                notes: formData.notes,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            }

            console.log("Submitting payload:", payload);

            if (isEditing) {
                if (!initialData.id) throw new Error("Missing ID for update");
                return apiClient.put(`/action-plans/${initialData.id}`, payload)
            } else {
                return apiClient.post('/action-plans', {
                    ...payload,
                    evalWeek1: 0, evalWeek2: 0, evalWeek3: 0, evalWeek4: 0, // Defaults for eval
                })
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
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-900">{isEditing ? "Edit Action Plan" : "New Action Plan"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Division (DIV)</label>
                            <input name="div" value={formData.div} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="e.g. Commercial" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                            <input name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="e.g. Sales" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">WIG (Wildly Important Goal)</label>
                        <input name="wig" value={formData.wig} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Primary goal..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">LAG Measure</label>
                            <input name="lag" value={formData.lag} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Historical metric..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">LEAD Measure</label>
                            <input name="lead" value={formData.lead} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" placeholder="Predictive action..." />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Action Plan Description</label>
                        <textarea name="plan" value={formData.plan} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none h-24 resize-none" placeholder="Describe the specific action..." />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">PIC</label>
                            <input name="pic" value={formData.pic} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Risk / Constraints</label>
                            <input name="risk" value={formData.risk} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Target Activity (Qty)</label>
                                <input type="number" name="targetActivity" value={formData.targetActivity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Target Nominal (Rp)</label>
                                <input type="number" name="targetNominal" value={formData.targetNominal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Realization & Notes</label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Realization Nominal (Rp)</label>
                                    <input type="number" name="realNominal" value={formData.realNominal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Realization (W1)</label>
                                    <StatusDropdown
                                        value={formData.realWeek1}
                                        onChange={(val) => setFormData(prev => ({ ...prev, realWeek1: val }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Notes</label>
                                    <input
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black/5 outline-none"
                                        placeholder="Add notes..."
                                    />
                                </div>
                            </div>
                        </div>
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


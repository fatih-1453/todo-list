"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Loader2, Plus, Pencil, Trash2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type RoadmapItem = {
    id: number
    quarter: string
    title: string
    description: string
    status: 'completed' | 'in-progress' | 'upcoming'
    displayOrder: number
    color: string
}

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null)

    // Fetch Items
    const { data: items, isLoading } = useQuery({
        queryKey: ['roadmap'],
        queryFn: () => apiClient.get<RoadmapItem[]>('/roadmap'),
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: Omit<RoadmapItem, 'id'>) => apiClient.post('/roadmap', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roadmap'] })
            setIsOpen(false)
            setEditingItem(null)
        }
    })

    const updateMutation = useMutation({
        mutationFn: (data: RoadmapItem) => apiClient.put(`/roadmap/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roadmap'] })
            setIsOpen(false)
            setEditingItem(null)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiClient.delete(`/roadmap/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roadmap'] })
        }
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = {
            quarter: formData.get('quarter') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            status: formData.get('status') as RoadmapItem['status'],
            displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
            color: formData.get('color') as string,
        }

        if (editingItem) {
            updateMutation.mutate({ ...data, id: editingItem.id })
        } else {
            createMutation.mutate(data)
        }
    }

    // Seed Data Function
    const handleSeedData = async () => {
        if (!confirm("This will add the template data from the reference image. Continue?")) return;

        const templateItems: Omit<RoadmapItem, 'id'>[] = [
            { quarter: "Q1'25", title: "Milestone", description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.", status: "completed", displayOrder: 1, color: "#A0F1E8" },
            { quarter: "Q2'25", title: "Milestone", description: "Maecenas porttitor congue massa. Fusce posuere, magna sed.", status: "completed", displayOrder: 2, color: "#6EE7D8" },
            { quarter: "Q3'25", title: "Milestone", description: "Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada.", status: "in-progress", displayOrder: 3, color: "#4FD1C5" },
            { quarter: "Q4'25", title: "Milestone", description: "Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.", status: "upcoming", displayOrder: 4, color: "#63B3ED" },
            { quarter: "Q1'26", title: "Milestone", description: "Pellentesque habitant morbi tristique senectus et netus et malesuada.", status: "upcoming", displayOrder: 5, color: "#7F9CF5" },
            { quarter: "Q2'26", title: "Milestone", description: "Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.", status: "upcoming", displayOrder: 6, color: "#9F7AEA" },
        ];

        try {
            await Promise.all(templateItems.map(item => createMutation.mutateAsync(item)));
            queryClient.invalidateQueries({ queryKey: ['roadmap'] });
        } catch (error) {
            console.error("Failed to seed data", error);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your application configuration and roadmap strategy.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSeedData} className="border-gray-200 hover:bg-gray-50">
                        <Database className="w-4 h-4 mr-2" />
                        Load Template Data
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold">Roadmap Milestones</h2>
                        <p className="text-sm text-gray-400">Define the journey shown on the login page.</p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setIsOpen(true); }} className="bg-black text-white hover:bg-gray-800 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Milestone
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-200" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items?.map((item) => (
                            <div key={item.id} className="relative group p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md" style={{ backgroundColor: item.color || '#000' }}>
                                        {item.quarter}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-lg" onClick={() => { setEditingItem(item); setIsOpen(true); }}>
                                            <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 text-red-500 rounded-lg" onClick={() => deleteMutation.mutate(item.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{item.description}</p>

                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-200 text-gray-600'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">Ord: {item.displayOrder}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quarter</label>
                                <Input name="quarter" defaultValue={editingItem?.quarter} placeholder="Q1 '25" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Display Order</label>
                                <Input name="displayOrder" type="number" defaultValue={editingItem?.displayOrder || 0} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input name="title" defaultValue={editingItem?.title} placeholder="Milestone Name" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input name="description" defaultValue={editingItem?.description} placeholder="Brief description..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select name="status" defaultValue={editingItem?.status || 'upcoming'}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color</label>
                                <Input name="color" type="color" defaultValue={editingItem?.color || '#000000'} className="h-10 p-1 cursor-pointer" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

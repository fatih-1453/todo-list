"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-gray-500">Manage your application configuration</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Roadmap Configuration</h2>
                    <Button onClick={() => { setEditingItem(null); setIsOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Milestone
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: item.color || '#000' }}>
                                        {item.quarter}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-200 text-gray-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsOpen(true); }}>
                                        <Pencil className="w-4 h-4 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteMutation.mutate(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
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

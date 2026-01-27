"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { useReminders, useCreateReminder, useDeleteReminder } from "@/hooks/use-reminders"
import { Plus, Bell, Calendar, Clock, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AlertsPage() {
    const { data: reminders, isLoading } = useReminders()
    const createReminder = useCreateReminder()
    const deleteReminder = useDeleteReminder()

    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [newReminder, setNewReminder] = React.useState({
        title: "",
        date: new Date().toISOString().split('T')[0],
        time: "09:00",
        color: "bg-blue-500",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createReminder.mutate({
            ...newReminder,
            isRecurring: false,
        }, {
            onSuccess: () => {
                setIsCreateOpen(false)
                toast.success("Reminder set successfully")
                setNewReminder({
                    title: "",
                    date: new Date().toISOString().split('T')[0],
                    time: "09:00",
                    color: "bg-blue-500",
                })
            }
        })
    }

    const COLORS = [
        { name: "Blue", value: "bg-blue-500" },
        { name: "Green", value: "bg-green-500" },
        { name: "Yellow", value: "bg-yellow-400" },
        { name: "Red", value: "bg-red-500" },
        { name: "Purple", value: "bg-purple-500" },
    ]

    return (
        <main className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 scrollbar-none">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">My Alerts</h1>
                                <p className="text-gray-500">Manage your reminders and notifications.</p>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Reminder</span>
                            </button>
                        </div>

                        {createReminder.isError && (
                            <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-xl">
                                Failed to create reminder. Please try again.
                            </div>
                        )}

                        {/* List */}
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                            </div>
                        ) : reminders && reminders.length > 0 ? (
                            <div className="grid gap-4">
                                {reminders.map((reminder) => (
                                    <div
                                        key={reminder.id}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-all"
                                    >
                                        <div className={cn("w-2 h-16 rounded-full shrink-0", reminder.color || "bg-gray-200")} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg truncate">{reminder.title}</h3>
                                                {new Date(reminder.date) < new Date(new Date().setHours(0, 0, 0, 0)) && (
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Overdue</span>
                                                )}
                                                {new Date(reminder.date).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10) && (
                                                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Today</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(reminder.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" />
                                                    {reminder.time}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteReminder.mutate(reminder.id, {
                                                onSuccess: () => toast.success("Reminder removed")
                                            })}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Reminder"
                                        >
                                            {deleteReminder.isPending ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">No reminders yet</h3>
                                <p className="text-gray-400 text-sm">Create your first reminder to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-6">New Reminder</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all"
                                    placeholder="e.g. Weekly Meeting"
                                    value={newReminder.title}
                                    onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all"
                                        value={newReminder.date}
                                        onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all"
                                        value={newReminder.time}
                                        onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Color Tag</label>
                                <div className="flex gap-3">
                                    {COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setNewReminder({ ...newReminder, color: color.value })}
                                            className={cn(
                                                "w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
                                                color.value,
                                                newReminder.color === color.value && "scale-110 ring-2 ring-offset-2 ring-black"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createReminder.isPending}
                                    className="flex-1 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {createReminder.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

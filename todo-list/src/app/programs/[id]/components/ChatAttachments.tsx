"use client"

import * as React from "react"
import {
    Paperclip,
    Image as ImageIcon,
    FileText,
    BarChart2,
    Calendar as CalendarIcon,
    X,
    Plus,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ChatAttachmentsProps {
    onFileSelect: (file: File) => void
    onPollCreate: (question: string, options: string[]) => void
    onEventCreate: (title: string, date: string, location: string, description: string) => void
    disabled?: boolean
}

export function ChatAttachments({ onFileSelect, onPollCreate, onEventCreate, disabled }: ChatAttachmentsProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [showPollModal, setShowPollModal] = React.useState(false)
    const [showEventModal, setShowEventModal] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const menuRef = React.useRef<HTMLDivElement>(null)

    // Handle outside click to close menu
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleFileClick = (accept: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = accept
            fileInputRef.current.click()
        }
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={menuRef}>
            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={(e) => {
                    if (e.target.files?.[0]) onFileSelect(e.target.files[0])
                }}
            />

            {/* Attachment Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-3 rounded-xl transition-all",
                    isOpen
                        ? "bg-blue-50 text-blue-600 rotate-45"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
                disabled={disabled}
                title="Attach..."
            >
                <Plus className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                    <div className="space-y-1">
                        <MenuItem
                            icon={FileText}
                            label="Document"
                            color="text-purple-500 bg-purple-50"
                            onClick={() => handleFileClick("*/*")}
                        />
                        <MenuItem
                            icon={ImageIcon}
                            label="Photo & Video"
                            color="text-blue-500 bg-blue-50"
                            onClick={() => handleFileClick("image/*,video/*")}
                        />
                        <MenuItem
                            icon={BarChart2}
                            label="Polling"
                            color="text-orange-500 bg-orange-50"
                            onClick={() => { setShowPollModal(true); setIsOpen(false); }}
                        />
                        <MenuItem
                            icon={CalendarIcon}
                            label="Event"
                            color="text-green-500 bg-green-50"
                            onClick={() => { setShowEventModal(true); setIsOpen(false); }}
                        />
                    </div>
                </div>
            )}

            {/* Poll Creator Modal */}
            {showPollModal && (
                <PollCreatorModal
                    onClose={() => setShowPollModal(false)}
                    onCreate={onPollCreate}
                />
            )}

            {/* Event Creator Modal */}
            {showEventModal && (
                <EventCreatorModal
                    onClose={() => setShowEventModal(false)}
                    onCreate={onEventCreate}
                />
            )}
        </div>
    )
}

function MenuItem({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
        >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", color)}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
        </button>
    )
}

// Poll Creator Component
function PollCreatorModal({ onClose, onCreate }: { onClose: () => void, onCreate: (q: string, o: string[]) => void }) {
    const [question, setQuestion] = React.useState("")
    const [options, setOptions] = React.useState(["", ""])

    const handleAddOption = () => {
        if (options.length < 10) setOptions([...options, ""])
    }

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...options]
        newOptions[idx] = val
        setOptions(newOptions)
    }

    const handleSubmit = () => {
        const validOptions = options.filter(o => o.trim())
        if (question.trim() && validOptions.length >= 2) {
            onCreate(question, validOptions)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Create Poll</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                        <input
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                                />
                                {options.length > 2 && (
                                    <button
                                        onClick={() => {
                                            const newOpts = [...options]
                                            newOpts.splice(idx, 1)
                                            setOptions(newOpts)
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {options.length < 10 && (
                            <button
                                onClick={handleAddOption}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 px-2 py-1"
                            >
                                + Add option
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
                        className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                    >
                        Create Poll
                    </button>
                </div>
            </div>
        </div>
    )
}

// Event Creator Component
function EventCreatorModal({ onClose, onCreate }: { onClose: () => void, onCreate: (t: string, d: string, l: string, desc: string) => void }) {
    const [title, setTitle] = React.useState("")
    const [date, setDate] = React.useState("")
    const [time, setTime] = React.useState("")
    const [location, setLocation] = React.useState("")
    const [desc, setDesc] = React.useState("")

    const handleSubmit = () => {
        if (title.trim() && date && time) {
            const dateTime = `${date}T${time}`
            onCreate(title, dateTime, location, desc)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Create Event</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Team Meeting"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                        <input
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. Meeting Room 1 or Zoom Link"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="Add details..."
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !date || !time}
                        className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                    >
                        Create Event
                    </button>
                </div>
            </div>
        </div>
    )
}

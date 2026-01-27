"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { useTeam, useCreateTeamMember } from "@/hooks/use-team"
import { Loader2, Mail, Link as LinkIcon, Copy, Check, UserPlus, Shield } from "lucide-react"

export default function SharePage() {
    const { data: members, isLoading } = useTeam()
    const createMember = useCreateTeamMember()

    const [email, setEmail] = useState("")
    const [role, setRole] = useState("Viewer")
    const [copied, setCopied] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")

    const handleCopyLink = () => {
        navigator.clipboard.writeText("https://todo-app.com/share/x8d9s0A")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        // Extract name from email for now as backend requires name
        const name = email.split("@")[0]

        createMember.mutate({ name, email, role }, {
            onSuccess: () => {
                setSuccessMsg(`Invited ${email} as ${role}`)
                setEmail("")
                setTimeout(() => setSuccessMsg(""), 3000)
            }
        })
    }

    return (
        <main className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 scrollbar-none">
                    <div className="max-w-2xl mx-auto w-full space-y-8">

                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold mb-2">Share & Collaborate</h1>
                            <p className="text-gray-500">Invite your team to this workspace.</p>
                        </div>

                        {/* Link Sharing Section */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                                    <LinkIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Copy Link</h3>
                                    <p className="text-xs text-gray-400">Anyone with the link can view</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 font-mono truncate">
                                    https://todo-app.com/share/x8d9s0A
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="bg-black text-white px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>

                        {/* Invite Section */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-[var(--accent-yellow)] p-2 rounded-xl text-black">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Invite People</h3>
                                    <p className="text-xs text-gray-400">Add members via email</p>
                                </div>
                            </div>

                            <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)]"
                                    />
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-yellow)] cursor-pointer"
                                >
                                    <option>Viewer</option>
                                    <option>Editor</option>
                                    <option>Admin</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={createMember.isPending}
                                    className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center"
                                >
                                    {createMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite"}
                                </button>
                            </form>
                            {successMsg && (
                                <div className="mt-3 text-center text-xs font-medium text-green-600 bg-green-50 py-2 rounded-lg animate-in fade-in slide-in-from-top-1">
                                    {successMsg}
                                </div>
                            )}
                        </div>

                        {/* Members List */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-sm mb-4">Who has access</h3>
                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
                                ) : (
                                    members?.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                                    style={{ backgroundColor: member.avatarColor || "#6B7280" }}
                                                >
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{member.name}</p>
                                                    <p className="text-xs text-gray-400">{member.email || "No email"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 border border-gray-100">
                                                    {member.role || "Member"}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}

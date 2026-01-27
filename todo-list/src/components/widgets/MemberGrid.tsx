"use client"

import { Mail, Phone, Calendar, MoreHorizontal, Loader2 } from "lucide-react"
import { useTeam } from "@/hooks/use-team"
import Link from "next/link"

export function MemberGrid() {
    const { data: members, isLoading, error } = useTeam()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-12">
                Error loading team. Make sure you are logged in.
            </div>
        )
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members?.map((member) => (
                <div
                    key={member.id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                >
                    {/* Status Dot */}
                    <div
                        className={`absolute top-6 left-6 w-2 h-2 rounded-full ${member.status === "Online"
                            ? "bg-green-500"
                            : member.status === "Busy" || member.status === "In Meeting"
                                ? "bg-red-500"
                                : "bg-gray-300"
                            }`}
                    />

                    <div className="flex justify-between items-start mb-6 pl-6">
                        <div></div>
                        <button className="text-gray-300 hover:text-black">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div
                            className={`w-20 h-20 rounded-full text-white flex items-center justify-center text-2xl font-bold mb-4 border-4 border-gray-50 group-hover:scale-110 transition-transform`}
                            style={{ backgroundColor: member.avatarColor || "#6B7280" }}
                        >
                            {getInitials(member.name)}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">{member.role || "Team Member"}</p>

                        <div className="flex gap-2 w-full">
                            <button className="flex-1 py-2.5 rounded-xl bg-black text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-2 group/btn">
                                <Mail className="w-4 h-4 text-white" />
                            </button>
                            <button className="flex-1 py-2.5 rounded-xl bg-black text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-2 group/btn">
                                <Phone className="w-4 h-4 text-white" />
                            </button>
                            <button className="flex-1 py-2.5 rounded-xl bg-black text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-2 group/btn">
                                <Calendar className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                        <span>Last active: {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString() : "N/A"}</span>
                        <span
                            className={`px-2 py-1 rounded-full bg-gray-50 ${member.status === "Online" ? "text-green-600 bg-green-50" : ""
                                }`}
                        >
                            {member.status}
                        </span>
                    </div>
                </div>
            ))}

            {/* Add Member Card */}
            <Link href="/share" className="rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-gray-300 hover:border-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-all cursor-pointer min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <span className="text-3xl font-light">+</span>
                </div>
                <span className="font-medium">Invite New Member</span>
            </Link>
        </div>
    )
}

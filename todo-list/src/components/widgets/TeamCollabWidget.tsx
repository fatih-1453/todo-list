"use client"

import { MoreHorizontal, Plus, Calendar, Loader2 } from "lucide-react"
import { useTeam } from "@/hooks/use-team"
import Link from "next/link"

const COLORS = ["bg-blue-500", "bg-green-500", "bg-orange-400", "bg-pink-500", "bg-purple-500", "bg-yellow-400"]

export function TeamCollabWidget() {
    const { data: members, isLoading, error } = useTeam()

    return (
        <div className="h-full bg-white rounded-3xl p-6 relative shadow-lg">
            {/* Decoration */}
            {/* <div className="absolute top-0 right-0 p-6 flex gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">AD</div>
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">ER</div>
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center text-xs">ZA</div>
            </div> */}

            <div className="mb-8">
                <Link href="/team" className="hover:opacity-70 transition-opacity inline-block">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="text-xl">👥</span> Team Collaboration
                    </h3>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Add Card */}
                <Link href="/team" className="border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:bg-gray-50 transition-colors cursor-pointer min-h-[140px]">
                    <Plus className="w-6 h-6 text-gray-300" />
                    <MoreHorizontal className="w-5 h-5 text-gray-300 self-end" />
                </Link>

                {/* Member Cards */}
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[140px] col-span-2 md:col-span-1">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 text-sm py-4 col-span-2 md:col-span-1">Failed to load</div>
                ) : members && members.length > 0 ? (
                    members.slice(0, 4).map((member, index) => (
                        <div key={member.id} className="bg-gray-50/50 rounded-2xl p-4 relative group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-10 h-10 rounded-full ${member.avatarColor || COLORS[index % COLORS.length]} text-white flex items-center justify-center text-xs font-bold`}>
                                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <Calendar className="w-4 h-4 text-gray-300" />
                            </div>

                            <div>
                                <h4 className="font-bold text-sm text-gray-800">{member.name}</h4>
                                <p className="text-xs text-gray-400 mb-2">{member.role || "Team Member"}</p>
                                <p className="text-[10px] text-gray-400 leading-tight">{member.status}</p>
                            </div>

                            {member.status === "Online" && (
                                <div className="absolute top-4 left-12 w-2 h-2 bg-green-500 rounded-full border border-white" />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 text-sm py-8 col-span-2 md:col-span-1">No team members</div>
                )}

                {members && members.length > 0 && (
                    <Link href="/team" className="border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:bg-gray-50 transition-colors cursor-pointer min-h-[140px]">
                        <Plus className="w-6 h-6 text-gray-300" />
                        <MoreHorizontal className="w-5 h-5 text-gray-300 self-end" />
                    </Link>
                )}
            </div>
        </div>
    )
}


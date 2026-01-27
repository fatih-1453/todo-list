"use client"

import * as React from "react"
import { BarChart2, Check, User } from "lucide-react"
import { programService, Discussion } from "@/services/programService"
import { cn } from "@/lib/utils"

interface PollCardProps {
    discussion: Discussion
    currentUserId: string
    onVote: (discussionId: number, optionIds: string[]) => void
}

export function PollCard({ discussion, currentUserId, onVote }: PollCardProps) {
    const metadata = discussion.metadata
    const options = metadata?.options || []
    const totalVotes = options.reduce((acc: number, opt: any) => acc + (opt.voterIds?.length || 0), 0)

    // Check if user has voted for any option
    const userVotes = options
        .filter((opt: any) => opt.voterIds?.includes(currentUserId))
        .map((opt: any) => opt.id)

    const handleVote = (optionId: string) => {
        // Toggle vote for this option
        // If single choice (default for now), we can implement logic to clear others
        // But for now let's assume multiple choice or simple toggle logic as per service

        // Simple toggle implementation:
        let newVotes = [...userVotes]
        if (newVotes.includes(optionId)) {
            newVotes = newVotes.filter(id => id !== optionId)
        } else {
            // If we want single choice, clear others:
            // newVotes = [optionId]
            newVotes.push(optionId)
        }

        onVote(discussion.id, newVotes)
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-sm w-full mt-2">
            <div className="p-4 border-b border-gray-100 bg-orange-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">Poll</h4>
                    <p className="text-xs text-gray-500">{metadata?.question || 'Asked a question'}</p>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {options.map((opt: any) => {
                    const voteCount = opt.voterIds?.length || 0
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
                    const isVoted = userVotes.includes(opt.id)

                    return (
                        <button
                            key={opt.id}
                            onClick={() => handleVote(opt.id)}
                            className={cn(
                                "w-full relative group transition-all",
                                "hover:opacity-95"
                            )}
                        >
                            {/* Progress bar background */}
                            <div className="absolute inset-0 bg-gray-50 rounded-lg overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        isVoted ? "bg-orange-100" : "bg-gray-200/50"
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            <div className="relative p-3 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                        isVoted
                                            ? "border-orange-500 bg-orange-500 text-white"
                                            : "border-gray-300 group-hover:border-orange-400"
                                    )}>
                                        {isVoted && <Check className="w-3 h-3" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{opt.text}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-500">
                                    {percentage}% <span className="font-normal text-gray-400">({voteCount})</span>
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100 flex justify-between">
                <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                <span>Click option to vote</span>
            </div>
        </div>
    )
}

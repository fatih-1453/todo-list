"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react"
import { Discussion } from "@/services/programService"
import { format } from "date-fns"

interface EventCardProps {
    discussion: Discussion
}

export function EventCard({ discussion }: EventCardProps) {
    const event = discussion.metadata
    if (!event) return null

    const eventDate = event.date ? new Date(event.date) : new Date()

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-sm w-full mt-2 group hover:shadow-md transition-all">
            <div className="p-4 border-b border-gray-100 bg-green-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">Event Invitation</h4>
                    <p className="text-xs text-gray-500">{event.title}</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-xl border border-gray-200 shrink-0">
                        <span className="text-xs font-bold text-red-500 uppercase">{format(eventDate, 'MMM')}</span>
                        <span className="text-xl font-bold text-gray-900">{format(eventDate, 'd')}</span>
                    </div>
                    <div>
                        <h5 className="font-bold text-gray-900 text-sm">{event.title}</h5>
                        {event.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{event.description}</p>}
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{format(eventDate, 'EEEE, h:mm a')}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{event.location}</span>
                        </div>
                    )}
                </div>
            </div>

            <button className="w-full py-3 bg-gray-50 text-xs font-bold text-gray-600 hover:bg-gray-100 border-t border-gray-100 transition-colors">
                Add to Calendar
            </button>
        </div>
    )
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    startOfWeek,
    endOfWeek,
    isWithinInterval
} from 'date-fns';
import { id } from 'date-fns/locale'; // Indonesian locale
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
    startDate?: Date;
    endDate?: Date;
    onChange: (start?: Date, end?: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(startDate || new Date());
    const [selectingEnd, setSelectingEnd] = useState(false); // If false, selecting start

    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    const handleDateClick = (date: Date) => {
        if (!startDate || (startDate && endDate && !selectingEnd)) {
            // Picking new start
            onChange(date, undefined);
            setSelectingEnd(true); // Auto switch to end date selection
        } else if (startDate && !endDate) {
            // Picking end
            if (date < startDate) {
                // If clicked date is before start, make it new start
                onChange(date, undefined);
                setSelectingEnd(true);
            } else {
                onChange(startDate, date);
                setSelectingEnd(false); // Reset
                setIsOpen(false); // Close on complete selection
            }
        } else if (selectingEnd && startDate) {
            // Explicitly picking end
            if (date < startDate) {
                onChange(date, undefined); // Swap to new start if earlier
                setSelectingEnd(true);
            } else {
                onChange(startDate, date);
                setIsOpen(false);
                setSelectingEnd(false);
            }
        } else {
            // Fallback
            onChange(date, undefined);
            setSelectingEnd(true);
        }
    };

    // Calendar Generation
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateView = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDateView = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDateView,
        end: endDateView,
    });

    const isSelected = (date: Date) => {
        if (startDate && isSameDay(date, startDate)) return true;
        if (endDate && isSameDay(date, endDate)) return true;
        return false;
    };

    const isInRange = (date: Date) => {
        if (startDate && endDate) {
            return isWithinInterval(date, { start: startDate, end: endDate });
        }
        return false;
    };

    // Formatted range string for trigger button
    const rangeString = startDate && endDate
        ? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        : startDate
            ? `${format(startDate, 'dd/MM/yyyy')}`
            : "Select Date Range";

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={toggleOpen}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 min-w-[200px] justify-center"
            >
                <CalendarIcon size={16} />
                {rangeString}
            </button>

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-[350px] animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">

                    {/* Inputs */}
                    <div className="flex gap-2 mb-4">
                        <div
                            className={cn(
                                "flex-1 p-2 rounded-lg border text-center text-sm cursor-pointer transition-all",
                                !selectingEnd ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                            )}
                            onClick={() => setSelectingEnd(false)}
                        >
                            {startDate ? format(startDate, 'MMM dd, yyyy') : "Start Date"}
                        </div>
                        <div
                            className={cn(
                                "flex-1 p-2 rounded-lg border text-center text-sm cursor-pointer transition-all",
                                selectingEnd ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                            )}
                            onClick={() => setSelectingEnd(true)}
                        >
                            {endDate ? format(endDate, 'MMM dd, yyyy') : "End Date"}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="font-semibold text-gray-700">
                            {format(viewDate, 'MMMM yyyy', { locale: id })}
                        </div>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
                            <div key={day} className="text-gray-400 font-medium py-1">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-sm">
                        {calendarDays.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, viewDate);
                            const selected = isSelected(day);
                            const inRange = isInRange(day);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDateClick(day)}
                                    className={cn(
                                        "h-9 w-full rounded-full flex items-center justify-center transition-all relative",
                                        !isCurrentMonth && "text-gray-300",
                                        isCurrentMonth && !selected && !inRange && "text-gray-700 hover:bg-gray-100",
                                        inRange && !selected && "bg-blue-50 text-blue-700 rounded-none first:rounded-l-full last:rounded-r-full my-[1px]", // Connected range bg
                                        selected && "bg-blue-500 text-white shadow-md shadow-blue-200 z-10",
                                        inRange && selected && "rounded-full" // Ensure selected ends are round
                                    )}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

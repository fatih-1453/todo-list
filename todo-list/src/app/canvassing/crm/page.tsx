"use client";

import React from 'react';
import { Users, Search, Filter } from 'lucide-react';

export default function CRMPage() {
    return (
        <div className="p-8 min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-200">
                                <Users size={24} />
                            </div>
                            CRM
                        </h1>
                        <p className="text-gray-500 mt-1 ml-14">Customer Relationship Management - Connections</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium shadow-orange-200 shadow-lg">
                        Add Contact
                    </button>
                </div>

                {/* Empty State / Placeholder */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Users className="text-orange-300" size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">CRM Module</h2>
                    <p className="text-gray-500 max-w-lg text-center mb-8">
                        The fully featured Customer Relationship Management module will be available here.
                        It will include contact tracking, interaction history, and deal pipelines.
                    </p>
                </div>
            </div>
        </div>
    );
}

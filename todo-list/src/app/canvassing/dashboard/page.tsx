"use client";

import React from 'react';
import { LayoutDashboard, TrendingUp, Users, Database } from 'lucide-react';

export default function CanvassingDashboardPage() {
    return (
        <div className="p-8 min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                                <LayoutDashboard size={24} />
                            </div>
                            Canvassing Dashboard
                        </h1>
                        <p className="text-gray-500 mt-1 ml-14">Overview of your canvassing activities and performance.</p>
                    </div>
                </div>

                {/* Coming Soon / Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Big Data</p>
                            <h3 className="text-2xl font-bold text-gray-900">1,245</h3>
                            <span className="text-xs text-green-600 font-medium">+12% this month</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">CRM Contacts</p>
                            <h3 className="text-2xl font-bold text-gray-900">850</h3>
                            <span className="text-xs text-gray-400 font-medium">Active leads</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Target Achievement</p>
                            <h3 className="text-2xl font-bold text-gray-900">78%</h3>
                            <span className="text-xs text-green-600 font-medium">On track</span>
                        </div>
                    </div>
                </div>

                {/* Placeholder Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LayoutDashboard className="text-gray-300" size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">More Insights Coming Soon</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Detailed analytics, charts, and reporting features are currently under development. Stay tuned for updates!
                    </p>
                </div>
            </div>
        </div>
    );
}

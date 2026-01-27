'use client';

import React, { useState } from 'react';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { LayoutGrid, Plus, Search, Edit, Loader2 } from 'lucide-react';
import { useDepartments, Department, useUpdateDepartment } from '@/hooks/useDepartments';
import { DepartmentFormModal } from '@/components/departments/DepartmentFormModal';

export default function DepartmentsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
    const [searchCode, setSearchCode] = useState('');
    const [searchName, setSearchName] = useState('');

    const { data: departments, isLoading } = useDepartments(searchCode, searchName);
    const updateMutation = useUpdateDepartment();

    const handleAddNew = () => {
        setSelectedDepartment(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setIsFormOpen(true);
    };

    const handleStatusToggle = async (department: Department) => {
        try {
            await updateMutation.mutateAsync({ id: department.id, data: { status: !department.status } });
        } catch (error) {
            console.error('Failed to update department status:', error);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-jakarta">
            <SidebarProvider>
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <TopNav />

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* Main Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

                                {/* Header & Filters */}
                                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 rounded-xl">
                                            <LayoutGrid className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <h1 className="text-xl font-bold text-slate-800">Departemen</h1>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                                        <div className="relative flex-1 md:w-48">
                                            <input
                                                type="text"
                                                placeholder="Cari Kode..."
                                                value={searchCode}
                                                onChange={(e) => setSearchCode(e.target.value)}
                                                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                            />
                                        </div>
                                        <div className="relative flex-1 md:w-64">
                                            <input
                                                type="text"
                                                placeholder="Cari Departemen..."
                                                value={searchName}
                                                onChange={(e) => setSearchName(e.target.value)}
                                                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                            />
                                        </div>
                                        <button className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm shadow-lg shadow-orange-500/20">
                                            Cari
                                        </button>
                                        <button
                                            onClick={handleAddNew}
                                            className="flex items-center justify-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm shadow-lg shadow-orange-500/20 whitespace-nowrap"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Tambah Baru
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50/50 text-slate-900 font-bold">
                                            <tr>
                                                <th className="px-6 py-4 rounded-l-xl w-16">#</th>
                                                <th className="px-6 py-4">Kode</th>
                                                <th className="px-6 py-4 w-1/3">Name</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 rounded-r-xl text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="py-12 text-center text-slate-400">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <Loader2 className="w-5 h-5 animate-spin" /> Load Data...
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : departments?.map((dept, idx) => (
                                                <tr key={dept.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4 font-medium text-slate-500">{idx + 1}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-700">{dept.code}</td>
                                                    <td className="px-6 py-4 text-slate-600">{dept.name}</td>
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="relative inline-flex items-center cursor-pointer"
                                                            onClick={() => handleStatusToggle(dept)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={dept.status}
                                                                readOnly
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleEdit(dept)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-emerald-100 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-50 text-xs text-slate-500">
                                    <span>Showing 1 to {departments?.length || 0} of {departments?.length || 0} items</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm border border-slate-200">
                                                &lt;
                                            </button>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-600 text-white shadow-md">
                                                1
                                            </button>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors">
                                                2
                                            </button>
                                            <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600 transition-colors">
                                                &gt;
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md">5</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </SidebarProvider>

            <DepartmentFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                departmentToEdit={selectedDepartment}
            />
        </div>
    );
}

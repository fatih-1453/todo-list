'use client';

import React, { useState } from 'react';
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees';
import { Employee } from '@/types/employee';
import { EmployeeFormModal } from '@/components/employees/EmployeeFormModal';
import Link from 'next/link';
import {
    Search,
    Plus,
    MoreHorizontal,
    Trash2,
    Edit,
    User,
    Calendar,
    MapPin,
    Briefcase,
    Loader2
} from 'lucide-react';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default function EmployeesPage() {
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);

    // Hooks
    const { data: employees, isLoading, isError } = useEmployees(search);
    const deleteMutation = useDeleteEmployee();

    // Handlers
    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleAddNew = () => {
        setSelectedEmployee(undefined);
        setIsFormOpen(true);
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-jakarta">
            <SidebarProvider>
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <TopNav />

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* Header & Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800">Daftar Pegawai</h1>
                                    <p className="text-slate-500 text-sm">Manage all your organization's employees</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari Nama..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddNew}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden md:inline">Tambah Pegawai</span>
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                {isLoading ? (
                                    <div className="p-12 flex justify-center items-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                        Loading employees...
                                    </div>
                                ) : isError ? (
                                    <div className="p-12 text-center text-red-500">
                                        Failed to load employees.
                                    </div>
                                ) : employees?.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        No employees found. Click "Tambah Pegawai" to create one.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4">Nama</th>
                                                    <th className="px-6 py-4">Tanggal Lahir</th>
                                                    <th className="px-6 py-4">Alamat</th>
                                                    <th className="px-6 py-4">Jenis Kelamin</th>
                                                    <th className="px-6 py-4">Penempatan</th>
                                                    <th className="px-6 py-4">Jabatan</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {employees?.map((employee, index) => (
                                                    <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <Link href={`/employees/${employee.id}`} className="block group/link">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${getAvatarColor(index)} overflow-hidden`}>
                                                                        {employee.photoUrl ? (
                                                                            <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            getInitials(employee.name)
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-slate-800 group-hover/link:text-blue-600 transition-colors">{employee.name}</div>
                                                                        <div className="text-xs text-slate-400">{employee.nip || 'No NIP'}</div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            <div className="flex items-center gap-2">
                                                                {employee.dateOfBirth || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                                            {employee.address || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {employee.gender || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600">
                                                            {employee.location || '-'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                                {employee.position || 'Staff'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEdit(employee)}
                                                                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(employee.id)}
                                                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Pagination (Visual Only for now) */}
                            {employees && employees.length > 0 && (
                                <div className="flex justify-between items-center text-sm text-slate-500">
                                    <span>Showing {employees.length} items</span>
                                    <div className="flex gap-1">
                                        <button className="px-3 py-1 border rounded hover:bg-slate-50" disabled>Previous</button>
                                        <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                                        <button className="px-3 py-1 border rounded hover:bg-slate-50" disabled>Next</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </SidebarProvider>

            <EmployeeFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                employeeToEdit={selectedEmployee}
            />
        </div>
    );
}

// Helpers
function getInitials(name: string) {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getAvatarColor(index: number) {
    const colors = [
        'from-blue-400 to-blue-600',
        'from-purple-400 to-purple-600',
        'from-pink-400 to-pink-600',
        'from-emerald-400 to-emerald-600',
        'from-amber-400 to-amber-600',
        'from-indigo-400 to-indigo-600',
    ];
    return colors[index % colors.length];
}

'use client';

import React, { useState } from 'react';
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { useUsers, useDeleteUser, useUpdateUser } from '@/hooks/useUsers';
import { AddUserModal } from './components/AddUserModal';
import { GroupList } from './components/GroupList';
import { GroupModal } from './components/GroupModal';
import { User } from '@/types/user';
import { Search, Plus, Edit, Trash2, UserCog, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');

    const { data: users, isLoading, isError } = useUsers(search);
    const deleteMutation = useDeleteUser();
    const updateMutation = useUpdateUser();

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const handleStatusToggle = async (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        try {
            await updateMutation.mutateAsync({ id: user.id, data: { status: newStatus } });
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleAddNew = () => {
        if (activeTab === 'users') {
            setSelectedUser(undefined);
            setIsUserModalOpen(true);
        } else {
            setIsGroupModalOpen(true);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FD] overflow-hidden font-jakarta">
            <SidebarProvider>
                <Sidebar className="flex-shrink-0" />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <TopNav />

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* Page Header */}
                            <div className="flex justify-between items-center">
                                <div className="text-sm breadcrumbs text-slate-400">
                                    <span className="mr-2">Master</span> &gt; <span className="ml-2 font-medium text-slate-800">Pengguna</span>
                                </div>
                                <button
                                    onClick={handleAddNew}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>{activeTab === 'users' ? 'Tambah Pengguna' : 'Tambah Group'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Left Panel: Settings */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                                <UserCog className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-slate-800">Pengguna Setting</h2>
                                                <p className="text-xs text-slate-500">Pengguna Information</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setActiveTab('users')}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                    activeTab === 'users'
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                                )}
                                            >
                                                <UserCog className="w-4 h-4" />
                                                Daftar Pengguna
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('groups')}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                                    activeTab === 'groups'
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                )}
                                            >
                                                <Users className="w-4 h-4" />
                                                Group Pengguna
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel: Content */}
                                <div className="lg:col-span-3">
                                    {activeTab === 'users' ? (
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[500px]">

                                            {/* List Header */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                                <div className="flex items-center gap-2">
                                                    <UserCog className="w-5 h-5 text-blue-600" />
                                                    <h2 className="text-lg font-bold text-slate-800">Daftar Pengguna</h2>
                                                </div>

                                                <div className="flex gap-2">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Cari pengguna..."
                                                            value={search}
                                                            onChange={(e) => setSearch(e.target.value)}
                                                            className="pl-4 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                                        />
                                                    </div>
                                                    <button className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm">
                                                        Cari
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-100">
                                                        <tr>
                                                            <th className="px-6 py-4 w-12">#</th>
                                                            <th className="px-6 py-4">Nama Pegawai</th>
                                                            <th className="px-6 py-4">Group</th>
                                                            <th className="px-6 py-4">WIG</th>
                                                            <th className="px-6 py-4">Username</th>
                                                            <th className="px-6 py-4">Status</th>
                                                            <th className="px-6 py-4 w-12 text-right"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {isLoading ? (
                                                            <tr>
                                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                                                    <div className="flex justify-center items-center gap-2">
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        Loading...
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : isError ? (
                                                            <tr>
                                                                <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                                                                    Error loading users.
                                                                </td>
                                                            </tr>
                                                        ) : users?.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                                                    No users found.
                                                                </td>
                                                            </tr>
                                                        ) : users?.map((user, index) => (
                                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                                                <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                                    {user.name}
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-600">
                                                                    {user.group?.name || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-600 uppercase">
                                                                    {user.wig || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-600">
                                                                    {user.username || '-'}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div
                                                                        className="relative inline-block w-10 h-5 transition duration-200 ease-in-out cursor-pointer"
                                                                        onClick={() => handleStatusToggle(user)}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={user.status === 'active'}
                                                                            readOnly
                                                                            className="absolute opacity-0 w-0 h-0"
                                                                        />
                                                                        <span className={cn(
                                                                            "block border rounded-full shadow-inner w-10 h-5 transition-colors duration-300",
                                                                            user.status === 'active' ? "bg-blue-600 border-blue-600" : "bg-slate-300 border-slate-300"
                                                                        )}></span>
                                                                        <span className={cn(
                                                                            "absolute left-0 top-0 bg-white rounded-full shadow w-5 h-5 transition-transform duration-300 transform",
                                                                            user.status === 'active' ? "translate-x-full" : "translate-x-0"
                                                                        )}></span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleEditUser(user)}
                                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                        >
                                                                            <Edit className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteUser(user.id)}
                                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination Mockup */}
                                            <div className="flex items-center justify-between mt-8 text-sm text-slate-500">
                                                <div>Showing 1 to {users?.length || 0} of {users?.length || 0} items</div>
                                                <div className="flex gap-1">
                                                    <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 text-slate-400" disabled>
                                                        &lt;
                                                    </button>
                                                    <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-medium">1</button>
                                                    <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50" disabled>
                                                        &gt;
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        <GroupList />
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </SidebarProvider>

            <AddUserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                userToEdit={selectedUser}
            />

            <GroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
            />
        </div>
    );
}

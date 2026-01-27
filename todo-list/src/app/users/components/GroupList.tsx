import React, { useState } from 'react';
import { useGroups, useDeleteGroup } from '@/hooks/useGroups';
import { Group } from '@/types/group';
import { Edit, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GroupModal } from './GroupModal';

export const GroupList: React.FC = () => {
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: groups, isLoading, isError } = useGroups(search);

    const handleEdit = (group: Group) => {
        setSelectedGroup(group);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[500px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">Group Pengguna</h2>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari Group..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-4 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                    </div>
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm">
                        Cari
                    </button>
                    {/* Note: "Tambah Group" is handled in parent via same modal or separate button? 
                        Design shows "Group Pengguna" specific layout.
                        But usually Add button is global or specific. 
                        Let's assume parent handles "Add" or we add one here if needed.
                        For now, keeping it consistent with UserList which has Add button in parent.
                    */}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 w-12">#</th>
                            <th className="px-6 py-4">Deskripsi</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 w-12 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-red-500">
                                    Error loading groups.
                                </td>
                            </tr>
                        ) : groups?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No groups found.
                                </td>
                            </tr>
                        ) : groups?.map((group, index) => (
                            <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {group.name}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out pointer-events-none">
                                        <input
                                            type="checkbox"
                                            checked={group.status === 'active'}
                                            readOnly
                                            className="absolute opacity-0 w-0 h-0"
                                        />
                                        <span className={cn(
                                            "block border rounded-full shadow-inner w-10 h-5 transition-colors duration-300",
                                            group.status === 'active' ? "bg-blue-600 border-blue-600" : "bg-slate-300 border-slate-300"
                                        )}></span>
                                        <span className={cn(
                                            "absolute left-0 top-0 bg-white rounded-full shadow w-5 h-5 transition-transform duration-300 transform",
                                            group.status === 'active' ? "translate-x-full" : "translate-x-0"
                                        )}></span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(group)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors text-xs font-medium"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Mockup */}
            {groups && groups.length > 0 && (
                <div className="flex items-center justify-between mt-8 text-sm text-slate-500">
                    <div>Showing 1 to {groups.length} of {groups.length} items</div>
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
            )}

            <GroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                groupToEdit={selectedGroup}
            />
        </div>
    );
};

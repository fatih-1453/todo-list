import React, { useState } from 'react';
import { Organization, useOrganizations, useUpdateOrganization } from '@/hooks/useOrganizations';
import { OrgModal } from './OrgModal';
import { Search, Plus, Edit, ChevronRight, CheckCircle2, Loader2, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrgListProps {
    onSelect: (org: Organization) => void;
    selectedOrgId?: number;
}

export function OrgList({ onSelect, selectedOrgId }: OrgListProps) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orgToEdit, setOrgToEdit] = useState<Organization | undefined>(undefined);

    const { data: organizations, isLoading } = useOrganizations(search);
    const updateMutation = useUpdateOrganization();

    const handleEdit = (e: React.MouseEvent, org: Organization) => {
        e.stopPropagation();
        setOrgToEdit(org);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setOrgToEdit(undefined);
        setIsModalOpen(true);
    };

    const handleStatusToggle = async (e: React.MouseEvent, org: Organization) => {
        e.stopPropagation();
        const newStatus = org.status === 'active' ? 'inactive' : 'active';
        try {
            await updateMutation.mutateAsync({
                id: org.id,
                data: { status: newStatus }
            });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-180px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 21V7L13 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 21V11L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 9V9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 13V13.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 17V17.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Organisasi</h2>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <input
                            type="text"
                            placeholder="Cari Organisa..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                        <button className="absolute right-1 top-1 p-1 bg-white rounded-md shadow-sm text-xs font-medium text-slate-600">
                            Cari
                        </button>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Baru
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Table Header like Row */}
                        <div className="flex items-center px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 mb-2">
                            <div className="w-8">#</div>
                            <div className="flex-1">Nama</div>
                            <div className="w-24">Status</div>
                            <div className="w-40 text-right"></div>
                        </div>

                        {organizations?.map((org, index) => (
                            <div
                                key={org.id}
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 border group items-center",
                                    selectedOrgId === org.id
                                        ? "bg-orange-50 border-orange-200 shadow-sm"
                                        : "bg-white border-slate-50 hover:bg-slate-50"
                                )}
                            >
                                <div className="w-8 text-slate-500 text-sm">{index + 1}</div>
                                <div className="flex-1 font-medium text-slate-800">{org.name}</div>
                                <div className="w-24">
                                    <div
                                        className="relative inline-flex items-center cursor-pointer"
                                        onClick={(e) => handleStatusToggle(e, org)}
                                    >
                                        <input type="checkbox" className="sr-only peer" checked={org.status === 'active'} readOnly />
                                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                                    </div>
                                </div>
                                <div className="w-40 flex justify-end gap-2">
                                    <button
                                        onClick={(e) => handleEdit(e, org)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-100 text-emerald-600 bg-white hover:bg-emerald-50 text-xs font-medium transition-colors"
                                    >
                                        <Edit className="w-3 h-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onSelect(org)}
                                        className={cn(
                                            "flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                                            selectedOrgId === org.id
                                                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                                                : "bg-white border-purple-100 text-purple-600 hover:bg-purple-50"
                                        )}
                                    >
                                        <ChevronsRight className="w-3 h-3" />
                                        Pilih
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Mock */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>Showing 1 to {organizations?.length || 0} of {organizations?.length || 0} items</span>
                <button className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600">
                    50 <span className="text-[10px]">▼</span>
                </button>
            </div>

            <OrgModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                orgToEdit={orgToEdit}
            />
        </div>
    );
}

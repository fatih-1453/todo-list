import React, { useState } from 'react';
import { Organization } from '@/hooks/useOrganizations';
import { Position, usePositions, useUpdatePosition } from '@/hooks/usePositions';
import { PositionModal } from './PositionModal';
import { Search, Plus, Edit, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image'; // For illustration

interface PositionListProps {
    selectedOrg?: Organization;
}

export function PositionList({ selectedOrg }: PositionListProps) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [posToEdit, setPosToEdit] = useState<Position | undefined>(undefined);

    const { data: positions, isLoading } = usePositions(selectedOrg?.id?.toString(), search);
    const updateMutation = useUpdatePosition();

    const handleEdit = (pos: Position) => {
        setPosToEdit(pos);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setPosToEdit(undefined);
        setIsModalOpen(true);
    };

    const handleStatusToggle = async (pos: Position) => {
        try {
            await updateMutation.mutateAsync({
                id: pos.id,
                data: {
                    status: !pos.status,
                    orgId: selectedOrg?.id?.toString() // Pass explicit OrgID
                }
            });
        } catch (error) {
            console.error('Failed to update position status:', error);
        }
    };

    if (!selectedOrg) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center">
                {/* Header Mockup for Consistency */}
                <div className="w-full flex justify-between items-center mb-auto opacity-50 pointer-events-none grayscale">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 3V21" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Jabatan</h2>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-48 h-9 bg-slate-50 rounded-lg"></div>
                        <div className="w-20 h-9 bg-slate-100 rounded-lg"></div>
                        <div className="w-32 h-9 bg-slate-100 rounded-lg"></div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Data not found</h2>

                    {/* Placeholder Illustration - Using inline SVG or logic if image not available */}
                    {/* User provided images showed 3D characters. Using a placeholder or generic SVG here if no asset */}
                    <div className="relative w-64 h-64 mb-8">
                        {/* Mocking the illustration from screenshot with pure CSS/SVG shapes or simply text if assets missing */}
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-indigo-500">
                            <circle cx="100" cy="150" r="40" fill="#E0E7FF" />
                            <rect x="80" y="80" width="40" height="80" rx="20" fill="#818CF8" />
                            <circle cx="100" cy="60" r="15" fill="#C7D2FE" />
                            {/* Simple abstraction */}
                        </svg>
                    </div>
                </div>
                <div className="mt-auto"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-180px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Similar icon to Org but distinct if needed, using Org icon for now as per design */}
                            <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 21V7L13 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 21V11L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Jabatan</h2>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <input
                            type="text"
                            placeholder="Cari Jabatan..."
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
                ) : positions && positions.length > 0 ? (
                    <div className="space-y-2">
                        {/* Table Header */}
                        <div className="flex items-center px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 mb-2">
                            <div className="flex-1">Nama</div>
                            <div className="w-24">Status</div>
                            <div className="w-24 text-right"></div>
                        </div>

                        {positions.map((pos) => (
                            <div
                                key={pos.id}
                                className="flex items-center px-4 py-3 bg-white border border-slate-50 hover:bg-slate-50 rounded-xl transition-all duration-200 group"
                            >
                                <div className="flex-1 font-medium text-slate-800">{pos.name}</div>
                                <div className="w-24">
                                    <div
                                        className="relative inline-flex items-center cursor-pointer"
                                        onClick={() => handleStatusToggle(pos)}
                                    >
                                        <input type="checkbox" className="sr-only peer" checked={pos.status} readOnly />
                                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                                    </div>
                                </div>
                                <div className="w-24 flex justify-end">
                                    <button
                                        onClick={() => handleEdit(pos)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-100 text-emerald-600 bg-white hover:bg-emerald-50 text-xs font-medium transition-colors"
                                    >
                                        <Edit className="w-3 h-3" />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <p>No positions found.</p>
                    </div>
                )}
            </div>

            <PositionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                positionToEdit={posToEdit}
                orgId={selectedOrg.id.toString()}
            />
        </div>
    );
}

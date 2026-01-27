"use client";

import React, { useState } from 'react';
import { useTargets, useDeleteTarget } from '@/hooks/useCanvassing';
import { TargetTable } from '../components/TargetTable';
import { TargetModal } from '../components/TargetModal';
import { UploadModal } from '../components/UploadModal';
import { DateRangePicker } from '../components/DateRangePicker';
import { Upload, Search, Home, ChevronRight, MousePointerClick } from 'lucide-react'; // Changed icon for "Target Penerimaan" to match "Click" style if available, or keep Target icon
import { Target } from '@/types/canvassing';
import * as XLSX from 'xlsx';

export default function TargetPage() {
    // Date State - Declared before useTargets to fix "used before declaration" error
    const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1)); // Jan 1 current year
    const [endDate, setEndDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 31)); // Jan 31 current year

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedWig, setSelectedWig] = useState("");

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: targets, isLoading } = useTargets(startDate, endDate, debouncedSearch, selectedWig);
    const deleteMutation = useDeleteTarget();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<Target | undefined>(undefined);

    const handleEdit = (item: Target) => {
        setItemToEdit(item);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this target?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setItemToEdit(undefined);
    };



    // ... inside component ...

    const handleDownloadTemplate = () => {
        const currentYear = new Date().getFullYear();
        const headers = [`Target ${currentYear}`, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Total'];
        const data = [
            ['Perusahaan', 1000000, 3000000, 4000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 1000000, 17000000],
            ['Target Masjid', 3500000, 3700000, 6000000, 4000000, 4200000, 4400000, 4600000, 4800000, 5000000, 5200000, 5500000, 5700000, 56600000],
            ['UMKM', '', '', '', '', '', '', '', '', '', '', '', '', 0],
            ['Komunitas', '', '', '', '', '', '', '', '', '', '', '', '', 0],
            ['Sekolah', '', '', '', '', '', '', '', '', '', '', '', '', 0],
            ['Standbooth', '', 3000000, 3000000, '', '', '', '', '', '', '', '', '', 6000000],
            ['Khitanan Massal', '', '', '', '', '', '', '', '', '', 10000000, 10000000, '', 20000000],
            ['Ramadhan', '', 8000000, 12000000, '', '', '', '', '', '', '', '', '', 20000000],
            ['Kurban', '', '', '', '', 30000000, '', '', '', '', '', '', '', 30000000],
            ['Muaharram', '', '', '', '', '', 5000000, '', '', '', '', '', '', 5000000],
            ['Total Canvasing', 4500000, 17700000, 25000000, 5000000, 35200000, 10400000, 5600000, 5800000, 6000000, 6200000, 16500000, 16700000, 154600000]
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Add minimal formatting (autowidth)
        const wscols = headers.map(h => ({ wch: h.length + 5 }));
        wscols[0] = { wch: 20 }; // First column wider
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Target ${currentYear}`);
        XLSX.writeFile(wb, "Target_Canvasing_Template.xlsx");
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50 font-sans text-slate-800">
            {/* Top Header Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 gap-2">
                    <Home size={16} />
                    <ChevronRight size={16} />
                    <span>Penerimaan</span>
                    <ChevronRight size={16} />
                    <span className="font-medium text-gray-700">Target</span>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                        {/* Icon optional, using link icon style from image if needed, for now just text */}
                        <span className="transform rotate-45">∞</span> Target Canvasing
                    </button>
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(start, end) => {
                            if (start !== undefined) setStartDate(start);
                            if (end !== undefined) setEndDate(end);
                        }}
                    />
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
                {/* Card Header & Toolbar */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="text-[#14b8a6]">
                                <MousePointerClick size={28} /> {/* Best approximation for the click/cursor logo */}
                            </div>
                            <h1 className="text-xl font-bold text-slate-800">Target Penerimaan</h1>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari Lag..."
                                    className="pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 w-full md:w-48"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Jenis Donatur Dropdown */}
                            <select
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 cursor-pointer"
                                value={selectedWig} // Assuming we reuse this state variable, renaming it would be better but keeping simple for now
                                onChange={(e) => setSelectedWig(e.target.value)}
                            >
                                <option value="">Jenis Donatur</option>
                                <option value="Perusahaan">Perusahaan</option>
                                <option value="Target Masjid">Target Masjid</option>
                                <option value="UMKM">UMKM</option>
                                <option value="Komunitas">Komunitas</option>
                                <option value="Sekolah">Sekolah</option>
                                <option value="Standbooth">Standbooth</option>
                                <option value="Khitanan Massal">Khitanan Massal</option>
                                <option value="Ramadhan">Ramadhan</option>
                                <option value="Kurban">Kurban</option>
                                <option value="Muaharram">Muaharram</option>
                            </select>

                            {/* Cari Button */}
                            <button className="px-6 py-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white text-sm font-medium rounded-lg transition-colors">
                                Cari
                            </button>

                            {/* Download Template Button */}
                            <button
                                onClick={handleDownloadTemplate}
                                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Upload size={16} className="rotate-180" /> {/* Reusing upload icon rotated for download */}
                                Template
                            </button>

                            {/* Upload Target Button */}
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="px-6 py-2 bg-[#facc15] hover:bg-[#eab308] text-black text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Upload size={16} />
                                Upload Target
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 relative">
                    {!isLoading && (!targets || targets.length === 0) ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="text-3xl font-bold text-slate-800">Data tidak ditemukan</h2>
                        </div>
                    ) : (
                        <TargetTable
                            data={targets || []}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14b8a6]"></div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div>
                        Showing {targets?.length ? 1 : 0} to {targets?.length || 0} of {targets?.length || 0} items
                    </div>
                    <div>
                        <select className="bg-gray-50 border border-gray-200 rounded p-1 text-sm focus:outline-none">
                            <option>5</option>
                            <option>10</option>
                            <option>20</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TargetModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                itemToEdit={itemToEdit}
            />

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                endpoint="/canvassing/targets/upload"
                title="Upload Targets"
            />
        </div>
    );
}

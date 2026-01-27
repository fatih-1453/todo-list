"use client";

import React, { useState } from 'react';
import { useBigData, useDeleteBigData } from '@/hooks/useCanvassing';
import { BigDataTable } from '../components/BigDataTable';
import { BigDataModal } from '../components/BigDataModal';
import { UploadModal } from '../components/UploadModal';
import { Plus, Upload, Search, Database } from 'lucide-react';
import { BigData } from '@/types/canvassing';

export default function BigDataPage() {
    const { data: bigData, isLoading } = useBigData();
    const deleteMutation = useDeleteBigData();

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<BigData | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const handleEdit = (item: BigData) => {
        setItemToEdit(item);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this record?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setItemToEdit(undefined);
    };

    // Filter Data
    const filteredData = bigData?.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entryType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.donorType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.program?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="p-8 min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                                <Database size={24} />
                            </div>
                            Data Penginputan
                        </h1>
                        <p className="text-gray-500 mt-1 ml-14">Kelola data canvasing dan penyebaran.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const headers = ['Name', 'Phone', 'Email', 'Type', 'DonorType', 'Category', 'Program', 'Address', 'Status', 'Result'];
                                // Logic for CSV export could be enhanced later to include new fields
                                const csvContent = [headers.join(',')].join('\n'); // Placeholder logic
                                alert("Template download requires update for new fields."); // Temporary alert or just keep it simple
                            }}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
                        >
                            <Upload size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors rotate-180" />
                            Download Template
                        </button>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
                        >
                            <Upload size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                            Upload Data
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5"
                        >
                            <Plus size={18} />
                            Input Data
                        </button>
                    </div>
                </div>

                {/* Stats / Filters Area (Optional enhancement) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* We could add summary cards here later */}
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search name, type, program..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                    />
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <BigDataTable
                        data={filteredData}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Modals */}
            <BigDataModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                itemToEdit={itemToEdit}
            />

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                endpoint="/canvassing/big-data/upload"
                title="Upload Big Data"
            />
        </div>
    );
}

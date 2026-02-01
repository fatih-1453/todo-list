"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown, Edit2, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CanvasingInputPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Mock Data based on screenshot
    const transactionNumber = "M111002-260008";
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    // Form Submit Handler
    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Transform data as needed
            const payload = {
                ...data,
                transactionNumber, // Currently mock, backend could generate
                date: new Date(),
                amount: data.amount ? data.amount.replace(/[^0-9]/g, '') : '0' // Clean currency string
            };

            await apiClient.post('/transactions', payload);
            toast.success("Transaction saved successfully!");
            router.push('/canvassing/dashboard'); // Redirect or reset
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to save transaction.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50/50 font-sans text-gray-800">

            {/* Header / Stepper Placeholder */}
            <div className="max-w-5xl mx-auto mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <FileText className="text-blue-600" size={24} />
                    <h1 className="text-xl font-bold text-gray-800">Informasi Detail</h1>
                </div>

                {/* Simple Stepper UI */}
                <div className="flex items-center w-full mb-8">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm z-10">
                        1
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 font-bold text-sm z-10">
                        2
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                    {/* Section Header */}
                    <div className="flex items-center gap-2 mb-8">
                        <Edit2 className="text-yellow-500" size={20} />
                        <h2 className="text-lg font-bold text-gray-800">Jenis Transaksi</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">

                        {/* Row 1: Donasi, Penghimpunan, Nominal */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-4 space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Cara Donasi</label>
                                <div className="relative">
                                    <select {...register('donationMethod')} className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700">
                                        <option>Transfer</option>
                                        <option>Tunai</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Cara Penghimpunan</label>
                                <div className="relative">
                                    <select {...register('collectionMethod')} className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700">
                                        <option>Komunitas</option>
                                        <option>Individu</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Nominal</label>
                                <input
                                    {...register('amount')}
                                    type="text"
                                    placeholder="Rp 0"
                                    defaultValue="Rp 100.000"
                                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Row 2: No Transaksi, Tanggal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Nomor Transaksi</label>
                                <div className="w-full h-12 px-4 bg-gray-100 border border-transparent rounded-xl flex items-center text-gray-600 font-semibold">
                                    {transactionNumber}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Tanggal</label>
                                <div className="w-full h-12 px-4 bg-gray-100 border border-transparent rounded-xl flex items-center text-gray-600 font-semibold">
                                    {currentDate}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Akad, Jenis Akad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Akad</label>
                                <div className="relative">
                                    <select {...register('contract')} className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700">
                                        <option>Penerimaan Insho Umum</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Jenis Akad</label>
                                <div className="relative">
                                    <select {...register('contractType')} className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700">
                                        <option>Penerimaan Shodaqoh Umum</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Program, Jenis Program */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Program</label>
                                <div className="relative">
                                    <select {...register('program')} className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700">
                                        <option>Sosial Kemanusiaan</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Jenis Program</label>
                                <div className="relative">
                                    <select {...register('programType')} className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700">
                                        <option>Santunan Yatim dan Dhuafa</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Next Button / Actions (Optional but expected) */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                        Lanjut
                    </button>
                </div>
            </div>
        </div>
    );
}

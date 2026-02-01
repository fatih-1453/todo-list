"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, ChevronDown, Edit2, FileText, Info } from 'lucide-react';
import { format } from 'date-fns';

export default function CanvasingInputPage() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    // Mock Data based on screenshot
    const transactionNumber = "M111002-260008";
    const currentDate = "01/02/2026";

    // Form Submit Handler
    const onSubmit = (data: any) => {
        console.log("Form Data:", data);
        alert("Data submitted! (Check console for details)");
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

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Cara Donasi */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500">Cara Donasi</label>
                                <div className="relative">
                                    <select
                                        {...register('donationMethod')}
                                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 font-medium"
                                    >
                                        <option value="Transfer">Transfer</option>
                                        <option value="Tunai">Tunai</option>
                                        <option value="QRIS">QRIS</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Cara Penghimpunan */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500">Cara Penghimpunan</label>
                                <div className="relative">
                                    <select
                                        {...register('collectionMethod')}
                                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 font-medium"
                                    >
                                        <option value="Komunitas">Komunitas</option>
                                        <option value="Individu">Individu</option>
                                        <option value="Perusahaan">Perusahaan</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Nomor Transaksi (Read Only) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500">Nomor Transaksi</label>
                                <div className="w-full h-12 px-4 bg-gray-100 border border-gray-200 rounded-xl flex items-center text-gray-500 font-medium">
                                    {transactionNumber}
                                </div>
                            </div>

                            {/* Tanggal (Read Only for now or DatePicker) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500">Tanggal</label>
                                <div className="w-full h-12 px-4 bg-gray-100 border border-gray-200 rounded-xl flex items-center text-gray-500 font-medium relative">
                                    {currentDate}
                                    {/* <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} /> */}
                                </div>
                            </div>

                            {/* Akad */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-500">Akad</label>
                                <div className="relative">
                                    <select
                                        {...register('contract')}
                                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 font-medium"
                                    >
                                        <option value="Penerimaan Insho Umum">Penerimaan Insho Umum</option>
                                        <option value="Zakat">Zakat</option>
                                        <option value="Wakaf">Wakaf</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Nominal (Moved to right column to match layout slightly better if needed, but following row flow from screenshot) */}
                            {/* Actually in screenshot: Cara Donasi | Cara Penghimpunan | Nominal (is 3rd col?) NO, screenshot is 2 cols roughly but Nominal is solitary on far right in first row? 
                                Let's look closely at screenshot.
                                Row 1: Cara Donasi | Cara Penghimpunan | [Blank/Nominal?] -> Wait, Nominal is to the right of Cara Penghimpunan. It looks like a 3-column layout or mixed.
                                Screenshot:
                                Col 1: Cara Donasi
                                Col 2: Cara Penghimpunan
                                Col 3: Nominal (Rp 100.000)
                                
                                Row 2: Nomor Transaksi | Tanggal
                                Row 3: Akad | Jenis Akad
                                Row 4: Program | Jenis Program
                                
                                Ah, okay. Let's adjust grid to 3 columns for top row, or use a custom grid.
                                The rest look like 2 columns.
                                Let's try to match exactly.
                            */}

                            {/* Nominal - Floating or 3rd column? Let's make it 2-col grid but span somewhat? 
                                Actually, let's just stick to 2-col logic or 3-col logic.
                                Screenshot clearly shows Nominal as 3rd item in first row.
                            */}
                        </div>

                        {/* Custom Grid for Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-2">
                            {/* Nominal (Placing it here to match flow if we use absolute positioning or just grid)
                                 Wait, the previous grid closed. 
                                 Let's restructure the form to use a flexible grid layout to match screenshot perfectly.
                             */}
                        </div>
                    </form>

                    {/* Re-writing form content with better layout matching */}
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
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
                    >
                        Lanjut
                    </button>
                </div>
            </div>
        </div>
    );
}

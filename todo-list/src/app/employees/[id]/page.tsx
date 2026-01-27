'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEmployee } from '@/hooks/useEmployees';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { EmployeeFormModal } from '@/components/employees/EmployeeFormModal';
import { ArrowLeft, Edit, User, MapPin, Loader2, Phone, CreditCard, Smartphone, Camera } from 'lucide-react';
import { useUpdateEmployee } from '@/hooks/useEmployees';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth-client';

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { data: employee, isLoading, isError } = useEmployee(id);
    const updateEmployeeMutation = useUpdateEmployee();
    const { user } = useAuth();

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folderId', ''); // Optional: organize into specific folder if needed
            formData.append('orgId', String(employee?.orgId || '')); // Ensure orgId is passed if needed, though backend often handles it from token

            // 1. Upload the file
            // We use apiClient.post but we need to cast the response to get the path
            const uploadResponse = await apiClient.post<{ path: string }>('/files', formData);

            if (uploadResponse && uploadResponse.path) {
                // 2. Update employee record with new photoUrl
                await updateEmployeeMutation.mutateAsync({
                    id: id,
                    data: { photoUrl: uploadResponse.path }
                });

                // 3. If the employee is the current user, update the auth session
                if (employee?.email && user?.email && employee.email === user.email) {
                    await authClient.updateUser({
                        image: uploadResponse.path
                    });
                    // Force session refresh if needed, but updateUser usually handles it
                }

                toast.success("Profile picture updated successfully");
            }

        } catch (error) {
            console.error("Failed to upload image", error);
            toast.error("Failed to upload profile picture");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (isError || !employee) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center flex-col gap-4">
                <p className="text-red-500">Employee not found or error loading data.</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                >
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-jakarta">
            <SidebarProvider>
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <TopNav />

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-6xl mx-auto space-y-6">

                            {/* Navigation Header */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => router.push('/employees')}
                                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group"
                                >
                                    <div className="p-2 rounded-full group-hover:bg-white transition-colors">
                                        <ArrowLeft className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">Back to List</span>
                                    <span className="text-slate-300 mx-2">|</span>
                                    <span className="text-slate-400 italic">Profil</span>
                                </button>

                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Left Column: Profile Card */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center text-center h-full border border-slate-100">
                                        {/* Avatar */}
                                        <div className="relative group cursor-pointer w-32 h-32 mb-6">
                                            <div className="w-32 h-32 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm hover:shadow-md transition-all">
                                                {isUploading ? (
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                                                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                                                    </div>
                                                ) : null}

                                                {employee.photoUrl ? (
                                                    <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-4xl font-bold text-pink-400">
                                                        {getInitials(employee.name)}
                                                    </div>
                                                )}

                                                {/* Hover Edit Overlay */}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                                    <Camera className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </div>

                                        <h2 className="text-xl font-bold text-slate-900 mb-1">
                                            {employee.frontTitle} {employee.name} {employee.backTitle}
                                        </h2>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                                            {employee.position || 'Employee'}
                                        </p>

                                        {/* Location Tag */}
                                        <div className="bg-blue-500 text-white px-6 py-1.5 rounded-full text-sm font-medium mb-12 shadow-blue-200 shadow-lg">
                                            {employee.location || 'Head Office'}
                                        </div>

                                        {/* Basic Info List */}
                                        <div className="w-full space-y-6 text-left mt-auto">
                                            <div className="flex items-start gap-4">
                                                <User className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-semibold">NOMOR INDUK PEGAWAI</p>
                                                    <p className="font-bold text-slate-800">{employee.nip || '-'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <Smartphone className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-semibold">Nomor Telepon</p>
                                                    <p className="font-bold text-slate-800">{employee.phoneNumber || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="lg:col-span-2 space-y-6">

                                    {/* Personal Information */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-8">
                                            <User className="w-6 h-6 text-indigo-500" />
                                            <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">NIK</p>
                                                <p className="font-bold text-slate-800 text-lg">{employee.nik || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">JENIS KELAMIN</p>
                                                <p className="font-bold text-slate-800 text-lg">{employee.gender || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">TEMPAT, TANGGAL LAHIR</p>
                                                <p className="font-bold text-slate-800 text-lg">
                                                    {employee.placeOfBirth ? `${employee.placeOfBirth}, ` : ''}
                                                    {employee.dateOfBirth || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">AGAMA</p>
                                                <p className="font-bold text-slate-800 text-lg">{employee.religion || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-8">
                                            <MapPin className="w-6 h-6 text-indigo-500" />
                                            <h3 className="text-lg font-bold text-slate-800">Alamat</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
                                            <div className="md:col-span-2">
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">ALAMAT LENGKAP</p>
                                                <p className="font-bold text-slate-800 text-lg">{employee.address || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">RT / RW</p>
                                                <p className="font-bold text-slate-800 text-lg">
                                                    {employee.rt || '000'} / {employee.rw || '000'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">DESA / KELURAHAN</p>
                                                <p className="font-bold text-slate-800 text-lg">{employee.village || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">KECAMATAN</p>
                                                <p className="font-bold text-slate-800 text-lg uppercase">{employee.district || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">KABUPATEN / KOTA</p>
                                                <p className="font-bold text-slate-800 text-lg uppercase">{employee.city || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">PROVINSI</p>
                                                <p className="font-bold text-slate-800 text-lg uppercase">{employee.province || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">KODEPOS</p>
                                                <p className="font-bold text-slate-800 text-lg">{employee.postalCode || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </SidebarProvider>

            <EmployeeFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                employeeToEdit={employee}
            />
        </div>
    );
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

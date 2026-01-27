import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';
import { Department, useCreateDepartment, useUpdateDepartment } from '@/hooks/useDepartments';
import { toast } from "sonner";

interface DepartmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    departmentToEdit?: Department;
}

interface FormData {
    code: string;
    name: string;
}

export function DepartmentFormModal({ isOpen, onClose, departmentToEdit }: DepartmentFormModalProps) {
    const { register, handleSubmit, reset, setValue } = useForm<FormData>();

    const createMutation = useCreateDepartment();
    const updateMutation = useUpdateDepartment();

    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (departmentToEdit) {
            setValue('code', departmentToEdit.code);
            setValue('name', departmentToEdit.name);
        } else {
            reset({ code: '', name: '' });
        }
    }, [departmentToEdit, setValue, reset, isOpen]);

    const onSubmit = async (data: FormData) => {
        try {
            if (departmentToEdit) {
                await updateMutation.mutateAsync({ id: departmentToEdit.id, data });
                toast.success("Department updated successfully");
            } else {
                await createMutation.mutateAsync(data);
                toast.success("Department created successfully");
            }
            onClose();
        } catch (error) {
            console.error('Failed to save department:', error);
            toast.error("Failed to save department");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl transform transition-all animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        {departmentToEdit ? 'Edit Departemen' : 'Departemen Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Kode</label>
                            <input
                                {...register('code')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                placeholder="Cth: 613"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Deskripsi</label>
                            <input
                                {...register('name')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                placeholder="Cth: Marcom"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-bold text-sm disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

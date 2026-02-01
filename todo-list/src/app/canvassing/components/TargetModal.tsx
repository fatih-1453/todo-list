import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateTarget, useUpdateTarget } from '@/hooks/useCanvassing';
import { Target } from '@/types/canvassing';
import { X, Save } from 'lucide-react';

interface TargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemToEdit?: Target;
}

export const TargetModal: React.FC<TargetModalProps> = ({ isOpen, onClose, itemToEdit }) => {
    const createMutation = useCreateTarget();
    const updateMutation = useUpdateTarget();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Target>>();

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                // Formatting dates for input fields
                const formatted = {
                    ...itemToEdit,
                    startDate: itemToEdit.startDate ? new Date(itemToEdit.startDate).toISOString().split('T')[0] : '',
                    endDate: itemToEdit.endDate ? new Date(itemToEdit.endDate).toISOString().split('T')[0] : '',
                };
                reset(formatted);
            } else {
                reset({
                    achievedAmount: 0,
                    status: 'Active'
                });
            }
        }
    }, [isOpen, itemToEdit, reset]);

    const onSubmit = async (data: Partial<Target>) => {
        try {
            // Ensure numeric values
            const payload = {
                ...data,
                targetAmount: Number(data.targetAmount),
                achievedAmount: Number(data.achievedAmount),
                startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
                endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
            };

            if (itemToEdit) {
                // Sanitize payload for update - remove system fields
                const { id, orgId, createdAt, updatedAt, ...editableFields } = data as any;

                const updatePayload = {
                    title: editableFields.title,
                    type: editableFields.type,
                    status: editableFields.status,
                    targetAmount: Number(editableFields.targetAmount), // Keep as number for Target type
                    achievedAmount: Number(editableFields.achievedAmount),
                    startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
                    endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
                };

                await updateMutation.mutateAsync({
                    id: itemToEdit.id,
                    data: updatePayload
                });
            } else {
                await createMutation.mutateAsync(payload as any);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animated-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {itemToEdit ? 'Edit Target' : 'Set New Target'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                {...register('title', { required: 'Title is required' })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Q1 Sales Target"
                            />
                            {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                {...register('type', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Category</option>
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                {...register('status')}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Expired">Expired</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                            <input
                                {...register('targetAmount', { required: true, min: 0 })}
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Achieved Amount</label>
                            <input
                                {...register('achievedAmount')}
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                {...register('startDate')}
                                type="date"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                {...register('endDate')}
                                type="date"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="px-6 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Target
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

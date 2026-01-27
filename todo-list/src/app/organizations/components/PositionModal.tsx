import React, { useState, useEffect } from 'react';
import { Position, useCreatePosition, useUpdatePosition } from '@/hooks/usePositions';
import { X, Save, Loader2 } from 'lucide-react';

interface PositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    positionToEdit?: Position;
    orgId?: string;
}

export function PositionModal({ isOpen, onClose, positionToEdit, orgId }: PositionModalProps) {
    const [name, setName] = useState('');
    const createMutation = useCreatePosition();
    const updateMutation = useUpdatePosition();

    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (isOpen) {
            setName(positionToEdit?.name || '');
        }
    }, [isOpen, positionToEdit]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('Nama Jabatan wajib diisi');
            return;
        }

        try {
            if (positionToEdit) {
                await updateMutation.mutateAsync({
                    id: positionToEdit.id,
                    data: { name }
                });
            } else {
                await createMutation.mutateAsync({ name, orgId });
            }
            onClose();
        } catch (error) {
            console.error('Failed to save position:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {positionToEdit ? 'Jabatan Edit' : 'Tambah Jabatan'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Jabatan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Jabatan"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                        {/* Organization Display */}
                        {orgId && (
                            <div className="text-sm text-gray-500">
                                Organisasi ID: {orgId}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !name.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-medium text-sm disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

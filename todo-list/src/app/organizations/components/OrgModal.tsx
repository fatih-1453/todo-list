import React from 'react';
import { Organization, useCreateOrganization, useUpdateOrganization } from '@/hooks/useOrganizations';
import { X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrgModalProps {
    isOpen: boolean;
    onClose: () => void;
    orgToEdit?: Organization;
}

export function OrgModal({ isOpen, onClose, orgToEdit }: OrgModalProps) {
    const [name, setName] = React.useState('');
    const createMutation = useCreateOrganization();
    const updateMutation = useUpdateOrganization();

    React.useEffect(() => {
        if (isOpen) {
            setName(orgToEdit?.name || '');
        }
    }, [isOpen, orgToEdit]);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            if (orgToEdit) {
                await updateMutation.mutateAsync({
                    id: orgToEdit.id,
                    data: { name }
                });
            } else {
                await createMutation.mutateAsync({ name });
            }
            onClose();
        } catch (error) {
            console.error('Failed to save organization:', error);
            // Optionally add toast error here
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {orgToEdit ? 'Organisasi Edit' : 'Tambah Organisasi'}
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
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Organisasi"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                            {orgToEdit && (
                                <p className="mt-1 text-sm font-bold text-gray-900">{orgToEdit.name}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        disabled={isLoading}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !name.trim()}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-medium text-sm",
                            (isLoading || !name.trim()) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Saving...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateGroup, useUpdateGroup } from '@/hooks/useGroups';
import { Group, CreateGroupDTO } from '@/types/group';
import { X, Save, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupToEdit?: Group;
}

// Menu Structure Definition
interface MenuItem {
    key: string;
    label: string;
    children?: MenuItem[];
}

const MENU_STRUCTURE: MenuItem[] = [
    {
        key: 'master',
        label: 'Master',
        children: [
            { key: 'employees', label: 'Pegawai' },
            { key: 'users', label: 'Manajemen Pengguna' },
            { key: 'organizations', label: 'Organisasi' },
            { key: 'departments', label: 'Departemen' },
        ]
    },
    {
        key: 'todo_list',
        label: 'To Do List',
        children: [
            { key: 'home', label: 'Home' },
            { key: 'tasks', label: 'Tasks' },
            { key: 'alerts', label: 'Alerts' },
            { key: 'favorites', label: 'Favorites' },
        ]
    },
    {
        key: 'kpi',
        label: 'KPI',
        children: [
            { key: 'kpi_dashboard', label: 'Dashboard KPI' },
            { key: 'action_plan', label: 'Action Plan' },
            { key: 'timeline', label: 'Timeline' },
            { key: 'share', label: 'Share' },
            { key: 'team', label: 'Team' },
            { key: 'upload', label: 'Upload' },
        ]
    },
    { key: 'assessment', label: 'Assessment' },
    { key: 'programs', label: 'Programs Hub' },
    { key: 'chat', label: 'Chat' },
];

export const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, groupToEdit }) => {
    const createGroup = useCreateGroup();
    const updateGroup = useUpdateGroup();

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CreateGroupDTO>();
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (groupToEdit) {
                reset({
                    name: groupToEdit.name,
                    status: groupToEdit.status,
                });
                setSelectedPermissions(groupToEdit.permissions || []);
            } else {
                reset({
                    status: 'active',
                });
                setSelectedPermissions([]);
            }
        }
    }, [isOpen, groupToEdit, reset]);

    const handlePermissionToggle = (key: string) => {
        setSelectedPermissions(prev => {
            if (prev.includes(key)) {
                return prev.filter(k => k !== key);
            } else {
                return [...prev, key];
            }
        });
    };

    const onSubmit = async (data: CreateGroupDTO) => {
        try {
            const payload = { ...data, permissions: selectedPermissions };

            if (groupToEdit) {
                await updateGroup.mutateAsync({ id: groupToEdit.id, data: payload });
            } else {
                await createGroup.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save group:', error);
        }
    };

    if (!isOpen) return null;

    const InputClass = "w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50";
    const LabelClass = "block text-xs font-semibold text-slate-500 mb-1";

    // Recursive Menu Renderer
    const renderMenu = (items: MenuItem[], level = 0) => {
        return (
            <div className={cn("space-y-2", level > 0 && "ml-6 mt-2 border-l-2 border-slate-100 pl-4")}>
                {items.map(item => (
                    <div key={item.key}>
                        <div
                            className="flex items-center gap-3 cursor-pointer select-none group"
                            onClick={() => handlePermissionToggle(item.key)}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                selectedPermissions.includes(item.key)
                                    ? "bg-purple-600 border-purple-600 text-white"
                                    : "border-slate-300 bg-white group-hover:border-purple-400"
                            )}>
                                {selectedPermissions.includes(item.key) && <CheckSquare className="w-3.5 h-3.5" />}
                            </div>
                            <span className={cn(
                                "text-sm",
                                level === 0 ? "font-medium text-slate-700" : "text-slate-600"
                            )}>
                                {item.label}
                            </span>
                        </div>
                        {item.children && renderMenu(item.children, level + 1)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        Group
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="group-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div>
                            <label className={LabelClass}>Deskripsi</label>
                            <input
                                {...register('name', { required: 'Nama Group is required' })}
                                className={InputClass}
                                placeholder="Nama Group (e.g. Logistik)"
                            />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className={LabelClass + " mb-3"}>Menu Access</label>
                            <div className="border border-slate-200 rounded-xl p-4 max-h-[400px] overflow-y-auto bg-slate-50/30">
                                {renderMenu(MENU_STRUCTURE)}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center p-6 border-t border-slate-100">
                    <button
                        type="submit"
                        form="group-form"
                        disabled={createGroup.isPending || updateGroup.isPending}
                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {(createGroup.isPending || updateGroup.isPending) ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { useEmployees } from '@/hooks/useEmployees';
import { useGroups } from '@/hooks/useGroups';
import { useDepartments } from '@/hooks/useDepartments'; // Added useDepartments import
import { User, CreateUserDTO } from '@/types/user';
import { X, Save, Eye, EyeOff } from 'lucide-react';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: User;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, userToEdit }) => {
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    // Fetch Employees, Groups, and Departments
    const { data: employees } = useEmployees();
    const { data: groups } = useGroups();
    const { data: departments } = useDepartments(); // Fetched departments

    const [showPassword, setShowPassword] = React.useState(false);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CreateUserDTO & { confirmPassword?: string }>();

    const password = watch('password');

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                reset({
                    name: userToEdit.name,
                    email: userToEdit.email,
                    username: userToEdit.username,
                    role: userToEdit.role,
                    wig: userToEdit.wig || '', // Added default for wig
                    employeeId: userToEdit.employeeId,
                    groupId: userToEdit.groupId, // Added groupId
                    status: userToEdit.status,
                });
            } else {
                reset({
                    status: 'active',
                    role: 'user',
                });
            }
        }
    }, [isOpen, userToEdit, reset]);

    const onSubmit = async (data: CreateUserDTO & { confirmPassword?: string }) => {
        try {
            // Find employee name if employeeId is selected and name is empty (though name is required field)
            // Ideally name should correspond to employee name if employee is selected
            if (data.employeeId) {
                const selectedEmployee = employees?.find(e => e.id === Number(data.employeeId));
                if (selectedEmployee) {
                    data.name = selectedEmployee.name;
                }
            }

            // Remove confirmPassword from payload
            const { confirmPassword, ...payload } = data;

            if (userToEdit) {
                await updateUser.mutateAsync({ id: userToEdit.id, data: payload });
            } else {
                await createUser.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    };

    // Auto-fill email/name/wig if employee selected
    const selectedEmployeeId = watch('employeeId');
    useEffect(() => {
        if (selectedEmployeeId && employees) {
            const emp = employees.find(e => e.id === Number(selectedEmployeeId));
            if (emp) {
                setValue('name', emp.name);
                if (emp.email && !userToEdit) setValue('email', emp.email);

                // Auto-set WIG based on department
                if (emp.department && departments) {
                    const empDeptName = emp.department.toLowerCase();

                    // Find matching department in the fetched departments list
                    // Matches if employee department contains the department name or vice-versa
                    const matchedDept = departments.find(d =>
                        empDeptName.includes(d.name.toLowerCase()) ||
                        d.name.toLowerCase().includes(empDeptName)
                    );

                    if (matchedDept) {
                        setValue('wig', matchedDept.name);
                    }
                }
            }
        }
    }, [selectedEmployeeId, employees, departments, setValue, userToEdit]);

    if (!isOpen) return null;

    const InputClass = "w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50";
    const LabelClass = "block text-xs font-semibold text-slate-500 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">
                        {userToEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Employee Select */}
                        <div>
                            <label className={LabelClass}>Pegawai</label>
                            <select
                                {...register('employeeId')}
                                className={InputClass}
                            >
                                <option value="">Please Select</option>
                                {employees?.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} - {emp.position || 'Staff'} ({emp.department || 'No Dept'})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400 mt-1">Pilih pegawai untuk mengisi nama dan email otomatis.</p>
                        </div>

                        {/* Name (Hidden or Readonly if employee selected? Let's keep it editable but auto-filled) */}
                        <div className="hidden">
                            <input {...register('name')} />
                        </div>

                        {/* Username */}
                        <div>
                            <label className={LabelClass}>Username</label>
                            <input
                                {...register('username', { required: 'Username is required' })}
                                className={InputClass}
                                placeholder="username"
                            />
                            {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className={LabelClass}>Email</label>
                            <input
                                {...register('email', { required: 'Email is required' })}
                                type="email"
                                className={InputClass}
                                placeholder="email@example.com"
                            />
                            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                        </div>

                        {/* Password Section - Only required for new users */}
                        {!userToEdit && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={LabelClass}>Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                            })}
                                            className={InputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                                </div>
                                <div>
                                    <label className={LabelClass}>Confirm Password</label>
                                    <input
                                        type="password"
                                        {...register('confirmPassword', {
                                            required: 'Please confirm password',
                                            validate: val => val === password || 'Passwords do not match'
                                        })}
                                        className={InputClass}
                                    />
                                    {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="show-password-check" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="rounded border-gray-300" />
                            <label htmlFor="show-password-check" className="text-sm text-slate-600">show password</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Akses / Role */}
                            <div>
                                <label className={LabelClass}>Role</label>
                                <select {...register('role')} className={InputClass}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="staff">Staff</option>
                                    <option value="owner">Owner</option>
                                    <option value="admin1">admin1</option>
                                </select>
                            </div>

                            {/* Group */}
                            <div>
                                <label className={LabelClass}>Group</label>
                                <select
                                    {...register('groupId')}
                                    className={InputClass}
                                >
                                    <option value="">Select Group</option>
                                    {groups?.map(group => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Wig (Now populated from Departments) */}
                            <div>
                                <label className={LabelClass}>Wig (Departemen)</label>
                                <select {...register('wig')} className={InputClass}>
                                    <option value="">Please Select</option>
                                    {departments?.map(dept => (
                                        <option key={dept.id} value={dept.name}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-slate-100 gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="user-form"
                        disabled={createUser.isPending || updateUser.isPending}
                        className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        {(createUser.isPending || updateUser.isPending) ? 'Saving...' : (
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

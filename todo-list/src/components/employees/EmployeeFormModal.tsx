import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { usePositions } from '@/hooks/usePositions';
import { Employee, NewEmployee } from '@/types/employee';
import { X, Save, Building, User, MapPin, Calendar, Phone, Mail, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeToEdit?: Employee;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, employeeToEdit }) => {
    const createMutation = useCreateEmployee();
    const updateMutation = useUpdateEmployee();

    // Fetch departments from database
    const { data: departments, isLoading: isDepartmentsLoading } = useDepartments();

    // Fetch positions (for Jabatan dropdown)
    const { data: positions, isLoading: isPositionsLoading } = usePositions();

    // Helper to sanitize employee data for form (remove nulls)
    const getDefaultValues = (emp?: Employee): NewEmployee => {
        if (!emp) {
            return {
                name: '',
                status: 'Active'
            };
        }

        const { id, orgId, createdAt, updatedAt, ...rest } = emp;

        // Convert nulls to undefined for form compatibility
        const sanitized = Object.entries(rest).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value === null ? undefined : value
        }), {} as Record<string, any>);

        return sanitized as NewEmployee;
    };

    const { register, handleSubmit, formState: { errors }, reset } = useForm<NewEmployee>({
        defaultValues: getDefaultValues(employeeToEdit)
    });

    // Reset form when modal opens/closes or employee changes
    React.useEffect(() => {
        if (isOpen) {
            reset(getDefaultValues(employeeToEdit));
        }
    }, [isOpen, employeeToEdit, reset]);

    const onSubmit = async (data: NewEmployee) => {
        try {
            if (employeeToEdit) {
                await updateMutation.mutateAsync({ id: employeeToEdit.id, data });
                toast.success("Employee updated successfully");
            } else {
                await createMutation.mutateAsync(data);
                toast.success("Employee created successfully");
            }
            onClose();
        } catch (error) {
            console.error('Failed to save employee:', error);
            // Error handling usually done in mutation or global
        }
    };

    if (!isOpen) return null;

    const InputClass = "w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50";
    const LabelClass = "block text-xs font-semibold text-slate-500 mb-1";
    const SectionTitleClass = "text-lg font-bold text-slate-800 mb-4 flex items-center gap-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800">
                        {employeeToEdit ? 'Edit Pegawai' : 'Pegawai Baru'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                    <form id="employee-form" onSubmit={handleSubmit(onSubmit)}>

                        {/* Top Section - Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div>
                                <label className={LabelClass}>Departemen</label>
                                <select {...register('department')} className={InputClass} disabled={isDepartmentsLoading}>
                                    <option value="">{isDepartmentsLoading ? 'Loading...' : 'Please Select'}</option>
                                    {departments?.filter(d => d.status).map((dept) => (
                                        <option key={dept.id} value={dept.name}>{dept.code} - {dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={LabelClass}>Jabatan</label>
                                <select {...register('position')} className={InputClass} disabled={isPositionsLoading}>
                                    <option value="">{isPositionsLoading ? 'Loading...' : 'Please Select'}</option>
                                    {positions?.filter(p => p.status).map((pos) => (
                                        <option key={pos.id} value={pos.name}>{pos.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={LabelClass}>Lokasi</label>
                                <select {...register('location')} className={InputClass}>
                                    <option value="">Please Select</option>
                                    <option value="Jakarta">Jakarta</option>
                                    <option value="Bandung">Bandung</option>
                                    <option value="Surabaya">Surabaya</option>
                                </select>
                            </div>
                        </div>

                        {/* Top Section - Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className={LabelClass}>Tanggal Bergabung</label>
                                <input type="date" {...register('joinDate')} className={InputClass} />
                            </div>
                            <div>
                                <label className={LabelClass}>Status</label>
                                <select {...register('status')} className={InputClass}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Leave">Leave</option>
                                </select>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className={LabelClass}>NIP</label>
                                <input {...register('nip')} className={InputClass} placeholder="NIP Pegawai" />
                            </div>
                            <div>
                                <label className={LabelClass}>Nama Lengkap *</label>
                                <input {...register('name', { required: true })} className={InputClass} placeholder="Nama Lengkap" />
                                {errors.name && <span className="text-red-500 text-xs">Nama wajib diisi</span>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className={LabelClass}>Panggilan</label>
                                <input {...register('nickname')} className={InputClass} placeholder="Nama Panggilan" />
                            </div>
                            <div>
                                <label className={LabelClass}>Gelar Depan</label>
                                <input {...register('frontTitle')} className={InputClass} placeholder="Contoh: Dr." />
                            </div>
                            <div>
                                <label className={LabelClass}>Gelar Belakang</label>
                                <input {...register('backTitle')} className={InputClass} placeholder="Contoh: S.Kom" />
                            </div>
                        </div>

                        {/* Two Columns: Identitas & Alamat */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Identitas */}
                            <div className="bg-slate-50/50 p-6 rounded-xl border border-dashed border-slate-200">
                                <h3 className={SectionTitleClass}>
                                    <User className="w-5 h-5 text-purple-600" />
                                    Identitas
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={LabelClass}>NIK</label>
                                        <input {...register('nik')} className={InputClass} placeholder="Nomor Induk Kependudukan" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={LabelClass}>Tempat Lahir</label>
                                            <input {...register('placeOfBirth')} className={InputClass} />
                                        </div>
                                        <div>
                                            <label className={LabelClass}>Tanggal Lahir</label>
                                            <input type="date" {...register('dateOfBirth')} className={InputClass} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={LabelClass}>Jenis Kelamin</label>
                                            <select {...register('gender')} className={InputClass}>
                                                <option value="">Pilih jenis kelamin</option>
                                                <option value="Laki-laki">Laki-laki</option>
                                                <option value="Perempuan">Perempuan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={LabelClass}>Agama</label>
                                            <select {...register('religion')} className={InputClass}>
                                                <option value="">Pilih agama</option>
                                                <option value="Islam">Islam</option>
                                                <option value="Kristen">Kristen</option>
                                                <option value="Katolik">Katolik</option>
                                                <option value="Hindu">Hindu</option>
                                                <option value="Buddha">Buddha</option>
                                                <option value="Konghucu">Konghucu</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={LabelClass}>Kontak / No. HP</label>
                                        <input {...register('phoneNumber')} className={InputClass} placeholder="08..." />
                                    </div>
                                    <div>
                                        <label className={LabelClass}>Email</label>
                                        <input {...register('email')} className={InputClass} placeholder="email@example.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="bg-slate-50/50 p-6 rounded-xl border border-dashed border-slate-200">
                                <h3 className={SectionTitleClass}>
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Alamat Tinggal
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={LabelClass}>Alamat Lengkap</label>
                                        <textarea {...register('address')} className={cn(InputClass, "min-h-[80px]")} placeholder="Jalan, No. Rumah, dll" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className={LabelClass}>RT</label>
                                            <input {...register('rt')} className={InputClass} />
                                        </div>
                                        <div>
                                            <label className={LabelClass}>RW</label>
                                            <input {...register('rw')} className={InputClass} />
                                        </div>
                                        <div>
                                            <label className={LabelClass}>Kode Pos</label>
                                            <input {...register('postalCode')} className={InputClass} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={LabelClass}>Provinsi</label>
                                            <input {...register('province')} className={InputClass} placeholder="Pilih provinsi" />
                                        </div>
                                        <div>
                                            <label className={LabelClass}>Kabupaten/Kota</label>
                                            <input {...register('city')} className={InputClass} placeholder="Pilih Kabupaten" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={LabelClass}>Kecamatan</label>
                                            <input {...register('district')} className={InputClass} placeholder="Pilih kecamatan" />
                                        </div>
                                        <div>
                                            <label className={LabelClass}>Desa/Kelurahan</label>
                                            <input {...register('village')} className={InputClass} placeholder="Pilih desa" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 rounded-b-2xl gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="employee-form"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (
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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateBigData, useUpdateBigData } from '@/hooks/useCanvassing';
import { BigData } from '@/types/canvassing';
import { X, Save } from 'lucide-react';

interface BigDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemToEdit?: BigData;
}

export const BigDataModal: React.FC<BigDataModalProps> = ({ isOpen, onClose, itemToEdit }) => {
    const createMutation = useCreateBigData();
    const updateMutation = useUpdateBigData();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<BigData>>();

    const donorType = watch('donorType');
    const result = watch('result');

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                reset(itemToEdit);
            } else {
                reset({
                    status: 'New',
                    source: 'Manual',
                    entryType: 'Canvassing'
                });
            }
        }
    }, [isOpen, itemToEdit, reset]);

    const handleAutoCoordinate = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const coord = `${position.coords.latitude}, ${position.coords.longitude}`;
                setValue('coordinate', coord);
            }, (err) => {
                console.error("Geo error", err);
                alert("Could not get location. Please allow location access.");
            });
        }
    };

    const onSubmit = async (data: Partial<BigData>) => {
        try {
            if (itemToEdit) {
                await updateMutation.mutateAsync({ id: itemToEdit.id, data: { ...data, entryType: 'Canvassing' } });
            } else {
                await createMutation.mutateAsync({ ...data, entryType: 'Canvassing' } as any);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl animated-fade-in-up my-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {itemToEdit ? 'Edit Data Canvasing' : 'Input Data Canvasing'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Top Row: Type and Program */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Donatur</label>
                            <select
                                {...register('donorType')}
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Pilih Jenis</option>
                                <option value="Individu">Individu</option>
                                <option value="Masjid">Masjid</option>
                                <option value="Sekolah">Sekolah</option>
                                <option value="Mall">Mall</option>
                                <option value="Perusahaan">Perusahaan</option>
                                <option value="Komunitas">Komunitas</option>
                            </select>
                        </div>

                        {/* Sub Types */}
                        {donorType === 'Masjid' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Masjid</label>
                                <select
                                    {...register('donorSubType')}
                                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="Masjid Komplek">Masjid Komplek</option>
                                    <option value="Masjid Perusahaan">Masjid Perusahaan</option>
                                    <option value="Masjid Lingkungan">Masjid Lingkungan</option>
                                </select>
                            </div>
                        )}

                        {donorType === 'Sekolah' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang Sekolah</label>
                                <select
                                    {...register('donorSubType')}
                                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Jenjang</option>
                                    <option value="SD">SD</option>
                                    <option value="SMP">SMP</option>
                                    <option value="SMA">SMA</option>
                                    <option value="Kampus">Kampus</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                            <select
                                {...register('program')}
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Pilih Program</option>
                                <option value="Qurban">Qurban</option>
                                <option value="Ramadhan">Ramadhan</option>
                                <option value="Pendidikan">Pendidikan</option>
                                <option value="Muharram">Muharram</option>
                                <option value="Zakat Akhir Tahun">Zakat Akhir Tahun</option>
                                <option value="Optional">Optional</option>
                            </select>
                        </div>
                    </div>

                    {/* Common / Shared Input Section */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Data Detail</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Petugas</label>
                                <input {...register('officerName')} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Petugas" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kotak</label>
                                <input {...register('boxType')} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jenis Kotak" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Donatur</label>
                                <input {...register('name', { required: "Nama Donatur wajib diisi" })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Donatur" />
                                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No HP Donatur</label>
                                <input {...register('phone')} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="08..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tempat</label>
                                <input {...register('placeName')} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Tempat/Lokasi" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea {...register('address')} rows={2} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Alamat lengkap..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                                <input {...register('province')} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Provinsi" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                                <input {...register('district')} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kecamatan" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Titik Koordinat</span>
                                    <button type="button" onClick={handleAutoCoordinate} className="text-blue-600 text-xs font-bold hover:underline">
                                        Auto Detect Location
                                    </button>
                                </label>
                                <input {...register('coordinate')} className="w-full px-4 py-2 border bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="-6.200000, 106.816666" />
                            </div>

                            {/* Process / Result */}
                            <div className="md:col-span-2 border-t pt-4 mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Proses / Hasil Kunjungan</label>
                                <select {...register('result')} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Pilih Hasil</option>
                                    <option value="Closing">Closing (Masuk Penerimaan Canvasing)</option>
                                    <option value="Reschedule">Reschedule</option>
                                    <option value="Kunjungan Pusat">Kunjungan Pusat</option>
                                    <option value="Konfirmasi">Konfirmasi</option>
                                    <option value="Tolak">Tolak</option>
                                    <option value="Reminder">Reminder</option>
                                    <option value="Event & Booth">Event & Booth</option>
                                </select>
                            </div>

                            {/* Confirmation Sub-Option */}
                            {result === 'Konfirmasi' && (
                                <div className="md:col-span-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-yellow-800 mb-1">Metode Konfirmasi</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" value="Email" {...register('confirmationType')} className="text-yellow-600 focus:ring-yellow-500" />
                                            <span className="text-sm text-gray-700">Email</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" value="HP" {...register('confirmationType')} className="text-yellow-600 focus:ring-yellow-500" />
                                            <span className="text-sm text-gray-700">HP (Handphone)</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Closing Note */}
                            {result === 'Closing' && (
                                <div className="md:col-span-2 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-2 text-green-800 animate-in fade-in">
                                    <span className="text-sm font-medium">✔️ Data akan masuk ke Penerimaan Canvasing.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
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
                            <Save size={18} />
                            Save Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

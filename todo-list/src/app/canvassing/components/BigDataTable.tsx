import React from 'react';
import { BigData } from '@/types/canvassing';
import { Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';

interface BigDataTableProps {
    data: BigData[];
    onEdit: (item: BigData) => void;
    onDelete: (id: number) => void;
}

export function BigDataTable({ data, onEdit, onDelete }: BigDataTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Name & Location</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Donor Info</th>
                            <th className="px-6 py-4">Program</th>
                            <th className="px-6 py-4">Result / Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No data available.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{item.name}</span>
                                            {item.placeName && <span className="text-xs text-gray-500 font-medium">{item.placeName}</span>}
                                            <span className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={item.address || ''}>
                                                {item.address || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {item.phone && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Phone size={12} className="text-gray-400" />
                                                    {item.phone}
                                                </div>
                                            )}
                                            {item.email && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Mail size={12} className="text-gray-400" />
                                                    {item.email}
                                                </div>
                                            )}
                                            {item.officerName && (
                                                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 w-fit">
                                                    {item.officerName}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-700">{item.donorType || '-'}</span>
                                            {item.donorSubType && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                                    {item.donorSubType}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.program ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                                                {item.program}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {item.result && (
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${item.result === 'Closing' ? 'text-green-600' :
                                                            item.result === 'Tolak' ? 'text-red-500' :
                                                                'text-blue-600'
                                                        }`}>
                                                        {item.result}
                                                    </span>
                                                    {item.result === 'Konfirmasi' && item.confirmationType && (
                                                        <span className="text-[10px] text-gray-500 mt-0.5">
                                                            via {item.confirmationType}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium w-fit ${item.status === 'New' ? 'bg-blue-50 text-blue-700' :
                                                    item.status === 'Contacted' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

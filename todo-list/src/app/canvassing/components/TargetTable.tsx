import React from 'react';
import { Target } from '@/types/canvassing';
import { Edit, Trash2, TrendingUp, Calendar } from 'lucide-react';

interface TargetTableProps {
    data: Target[];
    onEdit: (item: Target) => void;
    onDelete: (id: number) => void;
}

export function TargetTable({ data, onEdit, onDelete }: TargetTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Target Amount</th>
                            <th className="px-6 py-4">Achieved</th>
                            <th className="px-6 py-4">Progress</th>
                            <th className="px-6 py-4">Period</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No targets set.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => {
                                const progress = item.targetAmount > 0 ? (item.achievedAmount / item.targetAmount) * 100 : 0;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{item.title}</div>
                                            <div className="text-xs text-gray-400 mt-1">{item.type}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">{formatCurrency(item.targetAmount)}</td>
                                        <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(item.achievedAmount)}</td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[140px]">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-medium text-gray-700">{progress.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-gray-500 text-xs">
                                                <Calendar size={12} className="mr-1.5" />
                                                <span>
                                                    {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Start'} -
                                                    {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'End'}
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
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

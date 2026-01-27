import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { BigData, Target } from '@/types/canvassing';

// Big Data Hooks
export const useBigData = () => {
    return useQuery({
        queryKey: ['big-data'],
        queryFn: async () => {
            const res = await apiClient.get<BigData[]>('/canvassing/big-data');
            return res; // apiClient usually returns data directly or we need to check implementation
        }
    });
};

export const useCreateBigData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<BigData, 'id' | 'createdAt' | 'updatedAt'>) => {
            return await apiClient.post('/canvassing/big-data', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['big-data'] });
        }
    });
};

export const useUpdateBigData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<BigData> }) => {
            return await apiClient.put(`/canvassing/big-data/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['big-data'] });
        }
    });
};

export const useDeleteBigData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            return await apiClient.delete(`/canvassing/big-data/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['big-data'] });
        }
    });
};

// Target Hooks
export const useTargets = (startDate?: Date, endDate?: Date, search?: string, type?: string) => {
    return useQuery({
        queryKey: ['targets', startDate, endDate, search, type],
        queryFn: async () => {
            const params: any = {};
            if (startDate) params.startDate = startDate.toISOString();
            if (endDate) params.endDate = endDate.toISOString();
            if (search) params.search = search;
            if (type && type !== 'Jenis Donatur') params.type = type;

            const res = await apiClient.get<Target[]>('/canvassing/targets', { params });
            return res;
        }
    });
};

export const useCreateTarget = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Target, 'id' | 'createdAt' | 'updatedAt'>) => {
            return await apiClient.post('/canvassing/targets', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['targets'] });
        }
    });
};

export const useUpdateTarget = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Target> }) => {
            return await apiClient.put(`/canvassing/targets/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['targets'] });
        }
    });
};

export const useDeleteTarget = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            return await apiClient.delete(`/canvassing/targets/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['targets'] });
        }
    });
};

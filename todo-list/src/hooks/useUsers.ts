import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User, CreateUserDTO } from '@/types/user';

export const useUsers = (search?: string) => {
    return useQuery({
        queryKey: ['users', search],
        queryFn: async () => {
            // If backend supports search, append query param. 
            // For now, fetching all and filtering client-side or assume backend handles it if passed.
            // Our backend route currently returns all, let's just fetch all.
            const data = await apiClient.get<User[]>('/users');
            if (search) {
                return data.filter(u =>
                    u.name.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase()) ||
                    u.username?.toLowerCase().includes(search.toLowerCase())
                );
            }
            return data;
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserDTO) => apiClient.post<User>('/users', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserDTO> }) =>
            apiClient.put<User>(`/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

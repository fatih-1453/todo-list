import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Group, CreateGroupDTO } from '@/types/group';

export const useGroups = (search?: string) => {
    return useQuery({
        queryKey: ['groups', search],
        queryFn: async () => {
            const data = await apiClient.get<Group[]>('/groups');
            if (search) {
                return data.filter(g =>
                    g.name.toLowerCase().includes(search.toLowerCase())
                );
            }
            return data;
        },
    });
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateGroupDTO) => apiClient.post<Group>('/groups', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
};

export const useUpdateGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateGroupDTO> }) =>
            apiClient.put<Group>(`/groups/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
};

export const useDeleteGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiClient.delete(`/groups/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
};

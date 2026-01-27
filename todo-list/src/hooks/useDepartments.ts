import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService, NewDepartment } from '@/services/departmentService';

export const DEPARTMENT_KEYS = {
    all: ['departments'] as const,
    lists: () => [...DEPARTMENT_KEYS.all, 'list'] as const,
    list: (codeFilter: string, nameFilter: string) => [...DEPARTMENT_KEYS.lists(), { codeFilter, nameFilter }] as const,
    details: () => [...DEPARTMENT_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...DEPARTMENT_KEYS.details(), id] as const,
};

// Re-export types from service
export type { Department, NewDepartment } from '@/services/departmentService';

// Hook to fetch all departments
export function useDepartments(searchCode?: string, searchName?: string) {
    return useQuery({
        queryKey: DEPARTMENT_KEYS.list(searchCode || '', searchName || ''),
        queryFn: () => departmentService.getAll(searchCode, searchName),
    });
}

// Hook to fetch single department
export function useDepartment(id: number) {
    return useQuery({
        queryKey: DEPARTMENT_KEYS.detail(id),
        queryFn: () => departmentService.getById(id),
        enabled: !!id,
    });
}

// Hook to create department
export function useCreateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NewDepartment) => departmentService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
        },
    });
}

// Hook to update department
export function useUpdateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NewDepartment> }) =>
            departmentService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.detail(data.id) });
        },
    });
}

// Hook to delete department
export function useDeleteDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => departmentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
        },
    });
}

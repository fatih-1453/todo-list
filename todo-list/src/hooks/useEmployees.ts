import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { NewEmployee } from '@/types/employee';

export const EMPLOYEE_KEYS = {
    all: ['employees'] as const,
    lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
    list: (filters: string) => [...EMPLOYEE_KEYS.lists(), { filters }] as const,
    details: () => [...EMPLOYEE_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...EMPLOYEE_KEYS.details(), id] as const,
};

// Hook to fetch employees
export function useEmployees(search?: string) {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.list(search || ''),
        queryFn: () => employeeService.getAll(search),
    });
}

// Hook to fetch single employee
export function useEmployee(id: number) {
    return useQuery({
        queryKey: EMPLOYEE_KEYS.detail(id),
        queryFn: () => employeeService.getById(id),
        enabled: !!id,
    });
}

// Hook to create employee
export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NewEmployee) => employeeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
        },
    });
}

// Hook to update employee
export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NewEmployee> }) =>
            employeeService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(data.id) });
        },
    });
}

// Hook to delete employee
export function useDeleteEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => employeeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
        },
    });
}

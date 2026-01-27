import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService, NewOrganization } from '@/services/organizationService';

export const ORGANIZATION_KEYS = {
    all: ['organizations'] as const,
    lists: () => [...ORGANIZATION_KEYS.all, 'list'] as const,
    details: () => [...ORGANIZATION_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...ORGANIZATION_KEYS.details(), id] as const,
    members: (id: number) => [...ORGANIZATION_KEYS.detail(id), 'members'] as const,
};

// Re-export types from service
export type { Organization, NewOrganization, OrganizationMember } from '@/services/organizationService';

// Hook to fetch user's organizations
export function useOrganizations(search: string = '') {
    return useQuery({
        queryKey: [...ORGANIZATION_KEYS.lists(), search],
        queryFn: async () => {
            const data = await organizationService.getAll();
            if (search) {
                return data.filter(org => org.name.toLowerCase().includes(search.toLowerCase()));
            }
            return data;
        },
    });
}

// Hook to fetch single organization
export function useOrganization(id: number) {
    return useQuery({
        queryKey: ORGANIZATION_KEYS.detail(id),
        queryFn: () => organizationService.getById(id),
        enabled: !!id,
    });
}

// Hook to fetch organization members
export function useOrganizationMembers(id: number) {
    return useQuery({
        queryKey: ORGANIZATION_KEYS.members(id),
        queryFn: () => organizationService.getMembers(id),
        enabled: !!id,
    });
}

// Hook to create organization
export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NewOrganization) => organizationService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.lists() });
        },
    });
}

// Hook to update organization
export function useUpdateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: NewOrganization }) => organizationService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORGANIZATION_KEYS.lists() });
        },
    });
}

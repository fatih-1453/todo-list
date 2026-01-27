import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { positionService, NewPosition, Position } from '@/services/positionService';

export const POSITION_KEYS = {
    all: ['positions'] as const,
    lists: () => [...POSITION_KEYS.all, 'list'] as const,
    list: (orgId?: string, nameFilter?: string) => [...POSITION_KEYS.lists(), { orgId, nameFilter }] as const,
    details: () => [...POSITION_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...POSITION_KEYS.details(), id] as const,
};

// Re-export types from service
export type { Position, NewPosition } from '@/services/positionService';

// Hook to fetch all positions by organization
// If orgId is not provided, backend will use activeOrgId from session
export function usePositions(orgId?: string, searchName?: string) {
    return useQuery({
        queryKey: POSITION_KEYS.list(orgId, searchName),
        queryFn: () => positionService.getAll(orgId, searchName),
        // Always enabled - backend uses session's activeOrgId if orgId not provided
    });
}

// Hook to fetch single position
export function usePosition(id: number) {
    return useQuery({
        queryKey: POSITION_KEYS.detail(id),
        queryFn: () => positionService.getById(id),
        enabled: !!id,
    });
}

// Hook to create position
export function useCreatePosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NewPosition) => positionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSITION_KEYS.lists() });
        },
    });
}

// Hook to update position
export function useUpdatePosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<NewPosition> & { orgId?: string } }) =>
            positionService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: POSITION_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: POSITION_KEYS.detail(data.id) });
        },
    });
}

// Hook to delete position
export function useDeletePosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => positionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSITION_KEYS.lists() });
        },
    });
}

import { apiClient } from '@/lib/api-client';

export interface Position {
    id: number;
    orgId: string;
    name: string;
    description?: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NewPosition {
    name: string;
    description?: string;
    status?: boolean;
    orgId?: string;
}

export const positionService = {
    // Get all positions by organization
    async getAll(orgId?: string, searchName?: string): Promise<Position[]> {
        const params = new URLSearchParams();
        if (orgId) params.append('orgId', orgId);
        if (searchName) params.append('name', searchName);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await apiClient.get<Position[]>(`/positions${query}`);
        return response;
    },

    // Get single position
    async getById(id: number): Promise<Position> {
        const response = await apiClient.get<Position>(`/positions/${id}`);
        return response;
    },

    // Create position
    async create(data: NewPosition): Promise<Position> {
        const response = await apiClient.post<Position>('/positions', data);
        return response;
    },

    // Update position
    async update(id: number, data: Partial<NewPosition> & { orgId?: string }): Promise<Position> {
        const response = await apiClient.put<Position>(`/positions/${id}`, data);
        return response;
    },

    // Delete position
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/positions/${id}`);
    }
};

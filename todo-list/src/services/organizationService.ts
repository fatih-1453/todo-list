import { apiClient } from '@/lib/api-client';

export interface Organization {
    id: number;
    name: string;
    ownerId: string;
    role?: 'Owner' | 'Admin' | 'Member';
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface NewOrganization {
    name?: string;
    status?: 'active' | 'inactive';
}

export interface OrganizationMember {
    id: string;
    name: string;
    email: string;
    role: 'Owner' | 'Admin' | 'Member';
    joinedAt: string;
}

export const organizationService = {
    // Get user's organizations
    async getAll(): Promise<Organization[]> {
        const response = await apiClient.get<Organization[]>('/organizations');
        return response;
    },

    // Get single organization
    async getById(id: number): Promise<Organization> {
        const response = await apiClient.get<Organization>(`/organizations/${id}`);
        return response;
    },

    // Create organization
    async create(data: NewOrganization): Promise<Organization> {
        const response = await apiClient.post<Organization>('/organizations', data);
        return response;
    },

    // Update organization
    async update(id: number, data: NewOrganization): Promise<Organization> {
        const response = await apiClient.put<Organization>(`/organizations/${id}`, data);
        return response;
    },

    // Get organization members
    async getMembers(id: number): Promise<OrganizationMember[]> {
        const response = await apiClient.get<OrganizationMember[]>(`/organizations/${id}/members`);
        return response;
    }
};

import { apiClient } from '@/lib/api-client';

export interface Department {
    id: number;
    orgId: number;
    code: string;
    name: string;
    description?: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NewDepartment {
    code: string;
    name: string;
    description?: string;
    status?: boolean;
}

export const departmentService = {
    // Get all departments
    async getAll(searchCode?: string, searchName?: string): Promise<Department[]> {
        const params = new URLSearchParams();
        if (searchCode) params.append('code', searchCode);
        if (searchName) params.append('name', searchName);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await apiClient.get<Department[]>(`/departments${query}`);
        return response;
    },

    // Get single department
    async getById(id: number): Promise<Department> {
        const response = await apiClient.get<Department>(`/departments/${id}`);
        return response;
    },

    // Create department
    async create(data: NewDepartment): Promise<Department> {
        const response = await apiClient.post<Department>('/departments', data);
        return response;
    },

    // Update department
    async update(id: number, data: Partial<NewDepartment>): Promise<Department> {
        const response = await apiClient.put<Department>(`/departments/${id}`, data);
        return response;
    },

    // Delete department
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/departments/${id}`);
    }
};

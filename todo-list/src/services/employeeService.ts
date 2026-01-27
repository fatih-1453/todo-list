import { apiClient } from '@/lib/api-client';
import { Employee, NewEmployee } from '@/types/employee';

export const employeeService = {
    // Get all employees
    async getAll(search?: string): Promise<Employee[]> {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await apiClient.get<Employee[]>(`/employees${query}`);
        return response;
    },

    // Get single employee
    async getById(id: number): Promise<Employee> {
        const response = await apiClient.get<Employee>(`/employees/${id}`);
        return response;
    },

    // Create employee
    async create(data: NewEmployee): Promise<Employee> {
        const response = await apiClient.post<Employee>('/employees', data);
        return response;
    },

    // Update employee
    async update(id: number, data: Partial<NewEmployee>): Promise<Employee> {
        const response = await apiClient.put<Employee>(`/employees/${id}`, data);
        return response;
    },

    // Delete employee
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/employees/${id}`);
    }
};

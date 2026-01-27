import { Employee } from './employee';
import { Group } from './group';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    image?: string;
    username?: string;
    role?: string;
    wig?: string;
    employeeId?: number;
    employee?: Employee;
    groupId?: number;
    group?: Group;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDTO {
    name: string;
    email: string;
    password?: string;
    username?: string;
    role: string;
    wig?: string;
    employeeId?: number | null;
    groupId?: number | null;
    status: 'active' | 'inactive';
}

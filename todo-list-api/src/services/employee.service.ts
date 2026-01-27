
import { eq, and, desc, like } from 'drizzle-orm';
import { db } from '../config/database';
import { employees, NewEmployee } from '../db/schema/index';

export const employeeService = {
    // Get all employees for an organization with optional search
    async getAllByOrg(orgId: string, search?: string, isGlobalView?: boolean) {
        let whereCondition = isGlobalView ? undefined : eq(employees.orgId, orgId);

        if (search) {
            const searchFilter = like(employees.name, `%${search}%`);
            whereCondition = whereCondition ? and(whereCondition, searchFilter)! : searchFilter;
        }

        const result = await db.query.employees.findMany({
            where: whereCondition,
            orderBy: [desc(employees.createdAt)],
        });

        return result;
    },

    // Get single employee by ID
    async getById(id: number, orgId: string) {
        const employee = await db.query.employees.findFirst({
            where: and(eq(employees.id, id), eq(employees.orgId, orgId)),
        });
        return employee;
    },

    // Create new employee
    async create(data: NewEmployee) {
        const [newEmployee] = await db.insert(employees).values(data).returning();
        return newEmployee;
    },

    // Update employee
    async update(id: number, orgId: string, data: Partial<NewEmployee>) {
        const [updated] = await db
            .update(employees)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(employees.id, id), eq(employees.orgId, orgId)))
            .returning();
        return updated;
    },

    // Delete employee
    async delete(id: number, orgId: string) {
        const [deleted] = await db
            .delete(employees)
            .where(and(eq(employees.id, id), eq(employees.orgId, orgId)))
            .returning();
        return deleted;
    }
};

import { eq, and, desc, like, or } from 'drizzle-orm';
import { db } from '../config/database';
import { departments, NewDepartment } from '../db/schema/index';

export const departmentService = {
    // Get all departments for an organization with filters
    async getAll(orgId: string, codeFilter?: string, nameFilter?: string, isGlobalView?: boolean) {
        let conditions = isGlobalView ? [] : [eq(departments.orgId, orgId)];

        if (codeFilter) {
            conditions.push(like(departments.code, `%${codeFilter}%`));
        }
        if (nameFilter) {
            conditions.push(like(departments.name, `%${nameFilter}%`));
        }

        const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

        const result = await db.query.departments.findMany({
            where: whereCondition,
            orderBy: [desc(departments.createdAt)],
        });

        return result;
    },

    // Get single department by ID
    async getById(id: number, orgId: string) {
        const department = await db.query.departments.findFirst({
            where: and(eq(departments.id, id), eq(departments.orgId, orgId)),
        });
        return department;
    },

    // Create new department
    async create(data: NewDepartment) {
        const [newDepartment] = await db.insert(departments).values(data).returning();
        return newDepartment;
    },

    // Update department
    async update(id: number, orgId: string, data: Partial<NewDepartment>) {
        const [updated] = await db
            .update(departments)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(departments.id, id), eq(departments.orgId, orgId)))
            .returning();
        return updated;
    },

    // Delete department
    async delete(id: number, orgId: string) {
        const [deleted] = await db
            .delete(departments)
            .where(and(eq(departments.id, id), eq(departments.orgId, orgId)))
            .returning();
        return deleted;
    }
};

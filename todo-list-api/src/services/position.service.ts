import { eq, and, desc, like, or } from 'drizzle-orm';
import { db } from '../config/database';
import { positions, NewPosition } from '../db/schema/index';

export const positionService = {
    // Get all positions for an organization with optional search
    // Get all positions for an organization with optional search
    async getAllByOrg(orgId: string, searchName?: string, isGlobalView?: boolean) {
        let baseCondition;

        if (isGlobalView) {
            baseCondition = undefined; // No base condition, start fresh
            if (searchName) {
                baseCondition = like(positions.name, `%${searchName}%`);
            }
        } else {
            baseCondition = eq(positions.orgId, orgId);
            if (searchName) {
                baseCondition = and(
                    eq(positions.orgId, orgId),
                    like(positions.name, `%${searchName}%`)
                )!;
            }
        }

        const result = await db.query.positions.findMany({
            where: baseCondition,
            orderBy: [desc(positions.createdAt)],
        });

        return result;
    },

    // Get single position by ID
    async getById(id: number, orgId: string) {
        const position = await db.query.positions.findFirst({
            where: and(eq(positions.id, id), eq(positions.orgId, orgId)),
        });
        return position;
    },

    // Create new position
    async create(data: NewPosition) {
        const result = await db.insert(positions).values(data).returning();
        return result[0];
    },

    // Update position
    async update(id: number, orgId: string, data: Partial<NewPosition>) {
        const result = await db
            .update(positions)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(positions.id, id), eq(positions.orgId, orgId)))
            .returning();
        return result[0];
    },

    // Delete position
    async delete(id: number, orgId: string) {
        const result = await db
            .delete(positions)
            .where(and(eq(positions.id, id), eq(positions.orgId, orgId)))
            .returning();
        return result[0];
    }
};

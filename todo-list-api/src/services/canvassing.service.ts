import { db } from '../config/database';
import { bigData, NewBigData, BigData } from '../db/schema/big-data';
import { targets, NewTarget, Target } from '../db/schema/targets';
import { eq, desc, and, gte, lte, ilike, or } from 'drizzle-orm';

export const canvassingService = {
    // Get all canvassing entries for an organization
    getAll: async (orgId: string, isGlobalView?: boolean) => {
        const whereCondition = isGlobalView ? undefined : eq(bigData.orgId, orgId);

        // Assuming 'bigData' is configured as a relation in your Drizzle DB instance
        // If not, you might need to adjust this to a standard select query.
        const result = await db.query.bigData.findMany({
            where: whereCondition,
            orderBy: [desc(bigData.createdAt)],
        });
        return result;
    },

    createBigData: async (data: NewBigData) => {
        const [newItem] = await db.insert(bigData).values(data).returning();
        return newItem;
    },

    updateBigData: async (id: number, orgId: string, data: Partial<NewBigData>) => {
        // Ensure we only update if it belongs to org
        const [updated] = await db.update(bigData)
            .set(data)
            .where(and(eq(bigData.id, id), eq(bigData.orgId, orgId)))
            .returning();
        return updated;
    },

    deleteBigData: async (id: number, orgId: string) => {
        await db.delete(bigData).where(and(eq(bigData.id, id), eq(bigData.orgId, orgId)));
        return true;
    },

    // Targets
    getAllTargets: async (orgId: string, startDate?: Date, endDate?: Date, search?: string, type?: string, isGlobalView?: boolean) => {
        const filters: (import('drizzle-orm').SQL | undefined)[] = [];

        // Only filter by orgId if not global view
        if (!isGlobalView) {
            filters.push(eq(targets.orgId, orgId));
        }

        if (startDate) {
            filters.push(gte(targets.startDate, startDate));
        }
        if (endDate) {
            filters.push(lte(targets.endDate, endDate));
        }
        if (type) {
            filters.push(eq(targets.type, type));
        }
        if (search) {
            filters.push(ilike(targets.title, `%${search}%`));
        }

        const whereCondition = filters.length > 0 ? and(...filters) : undefined;

        return await db.select()
            .from(targets)
            .where(whereCondition)
            .orderBy(desc(targets.createdAt));
    },

    createTarget: async (data: NewTarget) => {
        const [newItem] = await db.insert(targets).values(data).returning();
        return newItem;
    },

    createTargetsBulk: async (data: NewTarget[]) => {
        if (data.length === 0) return [];
        return await db.insert(targets).values(data).returning();
    },

    updateTarget: async (id: number, orgId: string, data: Partial<NewTarget>) => {
        const [updated] = await db.update(targets)
            .set(data)
            .where(and(eq(targets.id, id), eq(targets.orgId, orgId)))
            .returning();
        return updated;
    },

    deleteTarget: async (id: number, orgId: string) => {
        await db.delete(targets).where(and(eq(targets.id, id), eq(targets.orgId, orgId)));
        return true;
    },
};

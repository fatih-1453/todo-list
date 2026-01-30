import { eq, desc, and, inArray } from 'drizzle-orm';
import { db } from '../config/database';
import { actionPlans, NewActionPlan } from '../db/schema/index';

// Helper to safely parse dates
const parseDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string') {
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
};

export const actionPlanService = {
    // Get all plans for an organization (with optional filters)
    async getAllByOrg(orgId: string, filters?: { department?: string, pic?: string }) {
        const conditions = [eq(actionPlans.orgId, orgId)];

        if (filters?.department) {
            conditions.push(eq(actionPlans.department, filters.department));
        }
        if (filters?.pic) {
            conditions.push(eq(actionPlans.pic, filters.pic));
        }

        return await db.query.actionPlans.findMany({
            where: and(...conditions),
            orderBy: [desc(actionPlans.createdAt)],
            with: {
                creator: true
            }
        });
    },

    // Create a single plan
    async create(data: NewActionPlan) {
        console.log(`[ActionPlan] Creating:`, data);
        try {
            const sanitizedData = { ...data };
            sanitizedData.dueDate = parseDate(sanitizedData.dueDate);
            sanitizedData.startDate = parseDate(sanitizedData.startDate);
            sanitizedData.endDate = parseDate(sanitizedData.endDate);

            const [newPlan] = await db.insert(actionPlans).values(sanitizedData).returning();
            return newPlan;
        } catch (e) {
            console.error("[ActionPlan] Create Failed:", e);
            throw e;
        }
    },

    // Bulk create (for Excel upload)
    async bulkCreate(data: NewActionPlan[]) {
        if (data.length === 0) return [];
        // Sanitize all items
        const sanitizedData = data.map(item => ({
            ...item,
            dueDate: parseDate(item.dueDate),
            startDate: parseDate(item.startDate),
            endDate: parseDate(item.endDate)
        }));

        const newPlans = await db.insert(actionPlans).values(sanitizedData).returning();
        return newPlans;
    },

    // Update a plan
    async update(id: number, orgId: string, data: Partial<NewActionPlan>) {
        console.log(`[ActionPlan] Updating ID: ${id} Org: ${orgId}`, data);
        try {
            // Fix: Parse incoming ISO date strings back to Date objects for Drizzle
            // Also sanitize payload to prevent overwriting system fields
            const { id: _, orgId: __, createdById: ___, createdAt: ____, updatedAt: _____, ...updatableData } = data as any;

            const sanitizedData = { ...updatableData };

            // Helper to handle date strings
            if (sanitizedData.dueDate !== undefined) sanitizedData.dueDate = parseDate(sanitizedData.dueDate);
            if (sanitizedData.startDate !== undefined) sanitizedData.startDate = parseDate(sanitizedData.startDate);
            if (sanitizedData.endDate !== undefined) sanitizedData.endDate = parseDate(sanitizedData.endDate);

            // Helper to handle empty strings for numeric/decimal fields
            // List of numeric fields based on schema
            const numericFields = ['targetNominal', 'realNominal', 'targetActivity'];
            // Removed old evaluation week fields

            for (const field of numericFields) {
                if (sanitizedData[field] === "") {
                    sanitizedData[field] = 0; // Default to 0 for empty inputs
                }
            }

            const [updated] = await db
                .update(actionPlans)
                .set({ ...sanitizedData, updatedAt: new Date() })
                .where(and(eq(actionPlans.id, id), eq(actionPlans.orgId, orgId)))
                .returning();
            return updated;
        } catch (e) {
            console.error("[ActionPlan] Update Failed:", e);
            throw e;
        }
    },

    // Delete a plan
    async delete(id: number, orgId: string) {
        const [deleted] = await db
            .delete(actionPlans)
            .where(and(eq(actionPlans.id, id), eq(actionPlans.orgId, orgId)))
            .returning();
        return deleted;
    },

    // Delete all plans for an organization (Cleanup)
    async deleteAll(orgId: string) {
        return await db
            .delete(actionPlans)
            .where(eq(actionPlans.orgId, orgId));
    },

    // Bulk delete specific plans
    async bulkDelete(ids: number[], orgId: string) {
        if (ids.length === 0) return [];
        return await db
            .delete(actionPlans)
            .where(and(inArray(actionPlans.id, ids), eq(actionPlans.orgId, orgId)))
            .returning();
    }
};

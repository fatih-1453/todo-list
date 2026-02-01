import { eq, asc } from 'drizzle-orm';
import { db } from '../config/database';
import { roadmapItems, NewRoadmapItem } from '../db/schema/index';

export const roadmapService = {
    // Get all roadmap items (publicly accessible logic, so no org filter strictly required unless we want tenant-specific login pages)
    async getAll() {
        // Find many using query builder
        const items = await db.query.roadmapItems.findMany({
            orderBy: [asc(roadmapItems.displayOrder), asc(roadmapItems.createdAt)],
        });
        return items;
    },

    async create(data: NewRoadmapItem) {
        const [newItem] = await db.insert(roadmapItems).values(data).returning();
        return newItem;
    },

    async update(id: number, data: Partial<NewRoadmapItem>) {
        const [updated] = await db
            .update(roadmapItems)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(roadmapItems.id, id))
            .returning();
        return updated;
    },

    async delete(id: number) {
        const [deleted] = await db
            .delete(roadmapItems)
            .where(eq(roadmapItems.id, id))
            .returning();
        return deleted;
    }
};

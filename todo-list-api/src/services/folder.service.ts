import { db } from '../config/database';
import { folders } from '../db/schema/folders';
import { eq, and } from 'drizzle-orm';

export interface CreateFolderInput {
    name: string;
    orgId?: string;
    createdById: string;
    programId?: number;
}

export const folderService = {
    async create(input: CreateFolderInput) {
        const [folder] = await db.insert(folders).values(input).returning();
        return folder;
    },

    async getAll(orgId?: string, programId?: number) {
        if (programId) {
            return db.query.folders.findMany({
                where: eq(folders.programId, programId),
                orderBy: (folders, { desc }) => [desc(folders.createdAt)],
                with: {
                    creator: true
                }
            });
        }

        // Fallback for org-wide (if used elsewhere)
        if (orgId) {
            return db.query.folders.findMany({
                where: eq(folders.orgId, orgId),
                orderBy: (folders, { desc }) => [desc(folders.createdAt)],
                with: {
                    creator: true
                }
            });
        }
        return [];
    },

    async delete(id: number) {
        const [deleted] = await db.delete(folders)
            .where(eq(folders.id, id))
            .returning();
        return deleted;
    }
};

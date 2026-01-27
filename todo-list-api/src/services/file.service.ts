import { eq, desc, and, inArray } from 'drizzle-orm';
import { db } from '../config/database';
import { files, folders, NewFileRecord, NewFolder } from '../db/schema/index';

export const fileService = {
    // --- FOLDERS ---

    async getAllFolders(orgId: string) {
        return await db.query.folders.findMany({
            where: eq(folders.orgId, orgId),
            orderBy: [desc(folders.createdAt)],
            with: {
                creator: true
            }
        });
    },

    async createFolder(data: NewFolder) {
        const [folder] = await db.insert(folders).values(data).returning();
        return folder;
    },

    async deleteFolder(id: number, orgId: string) {
        // Cascade delete handles files, but let's be explicit if needed. 
        // Drizzle schema has { onDelete: 'cascade' } so DB handles it.
        const [deleted] = await db
            .delete(folders)
            .where(and(eq(folders.id, id), eq(folders.orgId, orgId)))
            .returning();
        return deleted;
    },

    // --- FILES ---

    async getAllFiles(orgId: string, folderId?: number) {
        const conditions = [eq(files.orgId, orgId)];

        if (folderId !== undefined) {
            // If folderId is provided, filter by it. 
            // If folderId is null? In JS null is object. 
            // Frontend should pass folderId or nothing.
            // If we want "root" files (no folder), we need explicit null check. 
            // For now, let's assume we filter if passed.
            conditions.push(eq(files.folderId, folderId));
        }

        return await db.query.files.findMany({
            where: and(...conditions),
            orderBy: [desc(files.createdAt)],
            with: {
                uploader: {
                    with: {
                        employee: true
                    }
                },
                folder: true
            }
        });
    },

    async getFilesByProgramId(programId: number, folderId?: number) {
        const conditions = [
            eq(files.programId, programId)
        ];

        if (folderId !== undefined) {
            conditions.push(eq(files.folderId, folderId));
        }

        return await db.query.files.findMany({
            where: and(...conditions),
            orderBy: [desc(files.createdAt)],
            with: {
                uploader: {
                    with: {
                        employee: true
                    }
                },
                folder: true
            }
        });
    },



    async createFile(data: NewFileRecord) {
        const [file] = await db.insert(files).values(data).returning();
        return file;
    },

    async deleteFile(id: number, orgId: string) {
        const [deleted] = await db
            .delete(files)
            .where(and(eq(files.id, id), eq(files.orgId, orgId)))
            .returning();
        return deleted;
    },

    async getFileById(id: number, orgId: string) {
        return await db.query.files.findFirst({
            where: and(eq(files.id, id), eq(files.orgId, orgId))
        });
    }
};

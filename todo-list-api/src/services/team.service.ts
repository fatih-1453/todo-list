import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { teamMembers, NewTeamMember } from '../db/schema/index';

export const teamService = {
    // Get all team members
    async getAll() {
        return db.query.teamMembers.findMany({
            orderBy: [desc(teamMembers.createdAt)],
        });
    },

    // Get a single team member by ID
    async getById(id: number) {
        return db.query.teamMembers.findFirst({
            where: eq(teamMembers.id, id),
        });
    },

    // Create a new team member
    async create(data: NewTeamMember) {
        const [newMember] = await db.insert(teamMembers).values(data).returning();
        return newMember;
    },

    // Update a team member
    async update(id: number, data: Partial<NewTeamMember>) {
        const [updated] = await db
            .update(teamMembers)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(teamMembers.id, id))
            .returning();

        return updated;
    },

    // Update member status
    async updateStatus(id: number, status: 'Online' | 'Offline' | 'Busy' | 'In Meeting') {
        const [updated] = await db
            .update(teamMembers)
            .set({ status, lastActiveAt: new Date(), updatedAt: new Date() })
            .where(eq(teamMembers.id, id))
            .returning();

        return updated;
    },

    // Delete a team member
    async delete(id: number) {
        const [deleted] = await db
            .delete(teamMembers)
            .where(eq(teamMembers.id, id))
            .returning();

        return deleted;
    },
};

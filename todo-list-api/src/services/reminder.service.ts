import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { reminders, reminderAssignees, NewReminder } from '../db/schema/index';

export const reminderService = {
    // Get all reminders for an organization
    async getAll(orgId: string, isGlobalView?: boolean) {
        const whereCondition = isGlobalView ? undefined : eq(reminders.orgId, orgId);

        const result = await db.query.reminders.findMany({
            where: whereCondition,
            with: {
                assignees: {
                    with: {
                        teamMember: true,
                    },
                },
            },
            orderBy: [desc(reminders.date), desc(reminders.time)],
        });

        return result.map(reminder => ({
            ...reminder,
            assignees: reminder.assignees.map(a => a.teamMember),
        }));
    },

    // Get today's reminders for an organization
    async getTodayByOrg(orgId: string) {
        const today = new Date().toISOString().split('T')[0];

        const result = await db.query.reminders.findMany({
            where: and(
                eq(reminders.orgId, orgId),
                eq(reminders.date, today)
            ),
            with: {
                assignees: {
                    with: {
                        teamMember: true,
                    },
                },
            },
            orderBy: [desc(reminders.time)],
        });

        return result.map(reminder => ({
            ...reminder,
            assignees: reminder.assignees.map(a => a.teamMember),
        }));
    },

    // Get a single reminder by ID
    async getById(id: number, orgId: string) {
        const result = await db.query.reminders.findFirst({
            where: and(eq(reminders.id, id), eq(reminders.orgId, orgId)),
            with: {
                assignees: {
                    with: {
                        teamMember: true,
                    },
                },
            },
        });

        if (!result) return null;

        return {
            ...result,
            assignees: result.assignees.map(a => a.teamMember),
        };
    },

    // Create a new reminder
    async create(data: NewReminder, assigneeIds?: number[]) {
        const [newReminder] = await db.insert(reminders).values(data).returning();

        if (assigneeIds && assigneeIds.length > 0) {
            await db.insert(reminderAssignees).values(
                assigneeIds.map(teamMemberId => ({
                    reminderId: newReminder.id,
                    teamMemberId,
                }))
            );
        }

        return this.getById(newReminder.id, data.orgId!);
    },

    // Update a reminder
    async update(id: number, orgId: string, data: Partial<NewReminder>) {
        const [updated] = await db
            .update(reminders)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(reminders.id, id), eq(reminders.orgId, orgId)))
            .returning();

        return updated;
    },

    // Delete a reminder
    async delete(id: number, orgId: string) {
        const [deleted] = await db
            .delete(reminders)
            .where(and(eq(reminders.id, id), eq(reminders.orgId, orgId)))
            .returning();

        return deleted;
    },
};

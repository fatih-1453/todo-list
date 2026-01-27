import { eq, desc, and } from 'drizzle-orm';
import { db } from '../config/database';
import { tasks, tags, taskTags, performanceStats, NewTask, Task, Tag } from '../db/schema/index';

export const taskService = {
    // Get all tasks for an organization
    async getAll(orgId: string, filters: {
        search?: string;
        status?: string;
        priority?: string;
        programId?: number;
    } = {}, isGlobalView?: boolean) {
        let whereCondition = isGlobalView ? undefined : eq(tasks.orgId, orgId);

        if (filters.programId) {
            whereCondition = whereCondition
                ? and(whereCondition, eq(tasks.programId, filters.programId))
                : eq(tasks.programId, filters.programId); // Should technically always be org scoped, but safe fallback
        }

        const result = await db.query.tasks.findMany({
            where: whereCondition, // Using the whereCondition here based on the new logic
            with: {
                user: {
                    with: {
                        employee: true
                    }
                },
                taskTags: {
                    with: {
                        tag: true,
                    },
                },
            },
            orderBy: [desc(tasks.createdAt)],
        });

        return result.map(task => ({
            ...task,
            tags: task.taskTags.map(tt => tt.tag),
        }));
    },

    // Get a single task by ID
    async getById(id: number, userId: string) {
        const result = await db.query.tasks.findFirst({
            where: and(eq(tasks.id, id), eq(tasks.userId, userId)),
            with: {
                user: {
                    with: {
                        employee: true
                    }
                },
                taskTags: {
                    with: {
                        tag: true,
                    },
                },
            },
        });

        if (!result) return null;

        return {
            ...result,
            tags: result.taskTags.map(tt => tt.tag),
        };
    },

    // Create a new task
    async create(data: NewTask, tagNames?: string[]) {
        const [newTask] = await db.insert(tasks).values(data).returning();

        if (tagNames && tagNames.length > 0) {
            await this.attachTags(newTask.id, tagNames);
        }

        // Return the task, note: this previously fetched by userId, might need update if we strictly use orgId now
        // But for now, returning simple object or fetching via ID is fine
        return this.getById(newTask.id, data.userId);
    },

    // Update a task
    async update(id: number, userId: string, data: Partial<NewTask>, isGlobalView?: boolean) {
        const whereCondition = isGlobalView ? eq(tasks.id, id) : and(eq(tasks.id, id), eq(tasks.userId, userId));

        const [updated] = await db
            .update(tasks)
            .set({ ...data, updatedAt: new Date() })
            .where(whereCondition)
            .returning();

        return updated;
    },

    // Toggle task done status
    async toggleDone(id: number, orgId: string) {
        const task = await db.query.tasks.findFirst({
            where: and(eq(tasks.id, id), eq(tasks.orgId, orgId)),
        });

        if (!task) return null;

        const [updated] = await db
            .update(tasks)
            .set({ done: !task.done, updatedAt: new Date() })
            .where(eq(tasks.id, id))
            .returning();

        // Update Performance Stats
        if (updated && updated.orgId && updated.userId) {
            const today = new Date().toISOString().split('T')[0];

            // Check if stat exists for today
            const existingStat = await db.query.performanceStats.findFirst({
                where: and(
                    eq(performanceStats.orgId, updated.orgId),
                    eq(performanceStats.userId, updated.userId),
                    eq(performanceStats.date, today)
                )
            });

            if (existingStat) {
                await db.update(performanceStats)
                    .set({
                        tasksDone: existingStat.tasksDone! + (updated.done ? 1 : -1),
                        tasksOngoing: existingStat.tasksOngoing! + (updated.done ? -1 : 1)
                    })
                    .where(eq(performanceStats.id, existingStat.id));
            } else {
                await db.insert(performanceStats).values({
                    orgId: updated.orgId,
                    userId: updated.userId,
                    date: today,
                    tasksDone: updated.done ? 1 : 0,
                    tasksOngoing: updated.done ? 0 : 1,
                    hoursSaved: '0'
                });
            }
        }

        return updated;
    },

    // Delete a task
    async delete(id: number, orgId: string) {
        const [deleted] = await db
            .delete(tasks)
            .where(and(eq(tasks.id, id), eq(tasks.orgId, orgId)))
            .returning();

        return deleted;
    },

    // Attach tags to a task
    async attachTags(taskId: number, tagNames: string[]) {
        for (const name of tagNames) {
            // Find or create tag
            let tag = await db.query.tags.findFirst({
                where: eq(tags.name, name),
            });

            if (!tag) {
                const [newTag] = await db.insert(tags).values({ name }).returning();
                tag = newTag;
            }

            // Create task-tag relationship
            await db.insert(taskTags).values({ taskId, tagId: tag.id }).onConflictDoNothing();
        }
    },

    // Update task tags
    async updateTags(taskId: number, tagNames: string[]) {
        // Remove existing tags
        await db.delete(taskTags).where(eq(taskTags.taskId, taskId));

        // Attach new tags
        if (tagNames.length > 0) {
            await this.attachTags(taskId, tagNames);
        }
    },
};

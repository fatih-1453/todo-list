import { eq, desc, and } from 'drizzle-orm';
import { db } from '../config/database';
import { assessments, assessmentSubtasks, comments, NewAssessment, NewAssessmentSubtask, NewComment } from '../db/schema/index';

export const assessmentService = {
    // Get all assessments for an organization
    async getAll(orgId: string, isGlobalView?: boolean) {
        const whereCondition = isGlobalView ? undefined : eq(assessments.orgId, orgId);

        const result = await db.query.assessments.findMany({
            where: whereCondition,
            orderBy: [desc(assessments.createdAt)],
            with: {
                assignee: true,
                subtasks: true,
                files: true,
                comments: {
                    with: {
                        user: true
                    },
                    orderBy: [desc(comments.createdAt)]
                }
            }
        });
        return result;
    },

    async create(data: NewAssessment, subtasksData?: string[]) {
        // 1. Create Assessment
        const [assessment] = await db.insert(assessments).values(data).returning();

        // 2. Create Subtasks if any
        if (subtasksData && subtasksData.length > 0) {
            const subtaskInserts = subtasksData.map(text => ({
                text,
                assessmentId: assessment.id,
                completed: false
            }));
            await db.insert(assessmentSubtasks).values(subtaskInserts);
        }

        // Return with relations
        return await db.query.assessments.findFirst({
            where: eq(assessments.id, assessment.id),
            with: { assignee: true, subtasks: true }
        });
    },

    async updateStatus(id: number, orgId: string, status: 'new' | 'progress' | 'complete' | 'acc_direksi') {
        const [updated] = await db
            .update(assessments)
            .set({ status, updatedAt: new Date() })
            .where(and(eq(assessments.id, id), eq(assessments.orgId, orgId)))
            .returning();
        return updated;
    },

    async toggleSubtask(id: number, completed: boolean) {
        const [updated] = await db
            .update(assessmentSubtasks)
            .set({ completed })
            .where(eq(assessmentSubtasks.id, id))
            .returning();
        return updated;
    },

    async delete(id: number, orgId: string) {
        const [deleted] = await db
            .delete(assessments)
            .where(and(eq(assessments.id, id), eq(assessments.orgId, orgId)))
            .returning();
        return deleted;
    },

    async addComment(data: NewComment) {
        const [comment] = await db.insert(comments).values(data).returning();
        return comment;
    }
};

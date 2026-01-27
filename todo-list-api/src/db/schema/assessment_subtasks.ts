import { pgTable, text, boolean, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { assessments } from './assessments';

export const assessmentSubtasks = pgTable('assessment_subtasks', {
    id: serial('id').primaryKey(),
    text: text('text').notNull(),
    completed: boolean('completed').default(false).notNull(),
    assessmentId: integer('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
});

export const assessmentSubtasksRelations = relations(assessmentSubtasks, ({ one }) => ({
    assessment: one(assessments, {
        fields: [assessmentSubtasks.assessmentId],
        references: [assessments.id],
    }),
}));

export type AssessmentSubtask = typeof assessmentSubtasks.$inferSelect;
export type NewAssessmentSubtask = typeof assessmentSubtasks.$inferInsert;

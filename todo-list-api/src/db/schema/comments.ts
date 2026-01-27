import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { assessments } from './assessments';

export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    text: text('text').notNull(),
    assessmentId: integer('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
    assessment: one(assessments, {
        fields: [comments.assessmentId],
        references: [assessments.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

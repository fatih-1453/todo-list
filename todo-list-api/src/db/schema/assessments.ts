import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';
import { assessmentSubtasks } from './assessment_subtasks';
import { files } from './files';
import { comments } from './comments';

export const assessments = pgTable('assessments', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    status: text('status', { enum: ['new', 'acc_direksi', 'progress', 'complete'] }).default('new').notNull(),
    tag: text('tag'), // e.g., 'Web', 'Blog'
    tagColor: text('tag_color'), // CSS class or hex
    dueDate: timestamp('due_date'),
    description: text('description'),
    cover: text('cover'), // URL to image

    // Stats cache (optional, or calculated)
    // For now let's calculate counts dynamically or store simple counters if performance needed.

    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [assessments.orgId],
        references: [organizations.id],
    }),
    assignee: one(users, {
        fields: [assessments.assigneeId],
        references: [users.id],
    }),
    subtasks: many(assessmentSubtasks),
    files: many(files),
    comments: many(comments),
}));

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;

import { pgTable, text, timestamp, serial, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';

export const programs = pgTable('programs', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: text('status').notNull().default('Planning'), // Active, Planning, On Hold, Completed
    deadline: text('deadline'),
    departments: text('departments').array().default([]),
    progress: integer('progress').default(0),
    description: text('description'),
    color: text('color'),
    startDate: timestamp('start_date'),
    category: text('category'),
    isTemplate: boolean('is_template').default(false),
    projectManager: text('project_manager'),
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const programsRelations = relations(programs, ({ one }) => ({
    organization: one(organizations, {
        fields: [programs.orgId],
        references: [organizations.id],
    }),
    creator: one(users, {
        fields: [programs.createdBy],
        references: [users.id],
    }),
}));

export type NewProgram = typeof programs.$inferInsert;

export const programDiscussions = pgTable('program_discussions', {
    id: serial('id').primaryKey(),
    programId: integer('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    type: text('type').default('discussion'), // discussion, report
    tags: text('tags').array(), // Urgent, Request, etc
    mediaUrl: text('media_url'),
    mediaType: text('media_type'), // image/png, application/pdf
    fileName: text('file_name'),
    fileSize: text('file_size'),
    metadata: jsonb('metadata'), // Poll options, Event details
    parentId: integer('parent_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const programDiscussionsRelations = relations(programDiscussions, ({ one, many }) => ({
    program: one(programs, {
        fields: [programDiscussions.programId],
        references: [programs.id],
    }),
    user: one(users, {
        fields: [programDiscussions.userId],
        references: [users.id],
    }),
    parent: one(programDiscussions, {
        fields: [programDiscussions.parentId],
        references: [programDiscussions.id],
        relationName: 'replies',
    }),
    replies: many(programDiscussions, {
        relationName: 'replies',
    }),
}));

export type ProgramDiscussion = typeof programDiscussions.$inferSelect;
export type NewProgramDiscussion = typeof programDiscussions.$inferInsert;

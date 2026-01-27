import { pgTable, text, timestamp, boolean, serial, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';

export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    programId: integer('program_id'), //.references(() => programs.id), // Avoiding circular import complexity for now or import safely
    text: text('text').notNull(),
    done: boolean('done').default(false),
    priority: text('priority', { enum: ['High', 'Medium', 'Low'] }).default('Medium'),
    dueDate: timestamp('due_date'),
    startDate: timestamp('start_date'),
    progress: integer('progress').default(0),
    dependencies: text('dependencies').array().default([]), // Using string array for simple ID storage
    group: text('group').default('Tasks'), // Formatting group/category name
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    color: text('color'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const taskTags = pgTable('task_tags', {
    taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.tagId] }),
}));

// Relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
    user: one(users, {
        fields: [tasks.userId],
        references: [users.id],
    }),
    taskTags: many(taskTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    taskTags: many(taskTags),
}));

export const taskTagsRelations = relations(taskTags, ({ one }) => ({
    task: one(tasks, {
        fields: [taskTags.taskId],
        references: [tasks.id],
    }),
    tag: one(tags, {
        fields: [taskTags.tagId],
        references: [tags.id],
    }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

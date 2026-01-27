import { pgTable, serial, text, timestamp, json } from 'drizzle-orm/pg-core';

export const groups = pgTable('groups', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    status: text('status', { enum: ['active', 'inactive'] }).default('active'),
    permissions: json('permissions').$type<string[]>().default([]), // Array of menu keys
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

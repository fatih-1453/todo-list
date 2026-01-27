import { pgTable, text, timestamp, serial, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';

export const departments = pgTable('departments', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    status: boolean('status').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const departmentsRelations = relations(departments, ({ one }) => ({
    organization: one(organizations, {
        fields: [departments.orgId],
        references: [organizations.id],
    }),
}));

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

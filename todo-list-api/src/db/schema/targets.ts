import { pgTable, text, serial, timestamp, integer, numeric } from 'drizzle-orm/pg-core';
import { users } from './users';
import { organizations } from './organizations';

export const targets = pgTable('targets', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: text('type').notNull(), // 'Revenue', 'Leads', 'Visits'
    targetAmount: numeric('target_amount').notNull(), // Use numeric for money/precise stats
    achievedAmount: numeric('achieved_amount').default('0'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    assignedTo: text('assigned_to').references(() => users.id), // Optional: assign to specific user
    status: text('status').default('Active'), // 'Active', 'Completed', 'Expired'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;

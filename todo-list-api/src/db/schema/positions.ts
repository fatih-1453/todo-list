import { pgTable, text, timestamp, serial, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';

export const positions = pgTable('positions', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    status: boolean('status').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const positionsRelations = relations(positions, ({ one }) => ({
    organization: one(organizations, {
        fields: [positions.orgId],
        references: [organizations.id],
    }),
}));

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

import { pgTable, text, timestamp, serial, integer, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';

export const performanceStats = pgTable('performance_stats', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    tasksDone: integer('tasks_done').default(0),
    tasksOngoing: integer('tasks_ongoing').default(0),
    hoursSaved: decimal('hours_saved', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const performanceStatsRelations = relations(performanceStats, ({ one }) => ({
    user: one(users, {
        fields: [performanceStats.userId],
        references: [users.id],
    }),
}));

export type PerformanceStat = typeof performanceStats.$inferSelect;
export type NewPerformanceStat = typeof performanceStats.$inferInsert;

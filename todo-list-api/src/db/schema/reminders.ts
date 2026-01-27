import { pgTable, text, timestamp, boolean, serial, integer, time, date, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { teamMembers } from './team-members';
import { organizations } from './organizations';

export const reminders = pgTable('reminders', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title'),
    time: time('time').notNull(),
    date: date('date').notNull(),
    color: text('color'),
    isRecurring: boolean('is_recurring').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const reminderAssignees = pgTable('reminder_assignees', {
    reminderId: integer('reminder_id').notNull().references(() => reminders.id, { onDelete: 'cascade' }),
    teamMemberId: integer('team_member_id').notNull().references(() => teamMembers.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.reminderId, table.teamMemberId] }),
}));

export const remindersRelations = relations(reminders, ({ one, many }) => ({
    user: one(users, {
        fields: [reminders.userId],
        references: [users.id],
    }),
    assignees: many(reminderAssignees),
}));

export const reminderAssigneesRelations = relations(reminderAssignees, ({ one }) => ({
    reminder: one(reminders, {
        fields: [reminderAssignees.reminderId],
        references: [reminders.id],
    }),
    teamMember: one(teamMembers, {
        fields: [reminderAssignees.teamMemberId],
        references: [teamMembers.id],
    }),
}));

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;

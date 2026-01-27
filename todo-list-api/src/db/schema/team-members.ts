import { pgTable, text, timestamp, serial, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const teamMembers = pgTable('team_members', {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    role: text('role'),
    status: text('status', { enum: ['Online', 'Offline', 'Busy', 'In Meeting'] }).default('Offline'),
    avatarColor: text('avatar_color'),
    lastActiveAt: timestamp('last_active_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
    user: one(users, {
        fields: [teamMembers.userId],
        references: [users.id],
    }),
}));

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

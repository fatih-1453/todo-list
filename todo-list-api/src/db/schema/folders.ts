import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';
import { files } from './files';
import { programs } from './programs';

export const folders = pgTable('folders', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    createdById: text('created_by_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    programId: integer('program_id').references(() => programs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [folders.orgId],
        references: [organizations.id],
    }),
    creator: one(users, {
        fields: [folders.createdById],
        references: [users.id],
    }),
    program: one(programs, {
        fields: [folders.programId],
        references: [programs.id],
    }),
    files: many(files),
}));

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

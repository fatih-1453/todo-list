import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';
import { folders } from './folders';
import { assessments } from './assessments';
import { programs } from './programs';

export const files = pgTable('files', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    size: text('size'), // Display size string e.g. "1.2 MB"
    type: text('type'), // MIME type
    path: text('path').notNull(), // Storage path or URL

    folderId: integer('folder_id').references(() => folders.id, { onDelete: 'cascade' }),
    assessmentId: integer('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }),
    programId: integer('program_id').references(() => programs.id, { onDelete: 'cascade' }),

    orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    uploadedById: text('uploaded_by_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const filesRelations = relations(files, ({ one }) => ({
    organization: one(organizations, {
        fields: [files.orgId],
        references: [organizations.id],
    }),
    uploader: one(users, {
        fields: [files.uploadedById],
        references: [users.id],
    }),
    folder: one(folders, {
        fields: [files.folderId],
        references: [folders.id],
    }),
    assessment: one(assessments, {
        fields: [files.assessmentId],
        references: [assessments.id],
    }),
    program: one(programs, {
        fields: [files.programId],
        references: [programs.id],
    }),
}));

export type FileRecord = typeof files.$inferSelect;
export type NewFileRecord = typeof files.$inferInsert;

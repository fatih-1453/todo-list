import { pgTable, text, timestamp, boolean, serial, integer, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';

export const actionPlans = pgTable('action_plans', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    createdById: text('created_by_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Identification
    pic: text('pic'), // Person In Charge
    position: text('position'), // Jabatan
    divisi: text('divisi'), // Division (previously div)
    subdivisi: text('subdivisi'),
    department: text('department'),
    executingAgency: text('executing_agency'), // Div Pelaksana

    // Core Content
    lead: text('lead').notNull(), // Activity Name (previously plan)
    program: text('program'),
    goal: text('goal'), // Tujuan
    indikator: text('indikator'),
    lokasi: text('lokasi'),

    // Dates
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    dueDate: timestamp('due_date'),

    // Metrics (Target & Realization)
    targetActivity: integer('target_activity').default(0),
    realActivity: integer('real_activity').default(0),
    targetNominal: decimal('target_nominal', { precision: 15, scale: 2 }).default('0'),
    realNominal: decimal('real_nominal', { precision: 15, scale: 2 }).default('0'),

    // Status & Classification
    status: text('status'), // (previously realWeek1) - e.g. "Done", "In Progress"
    classification: text('classification'), // Klasifikasi Pelaksanaan

    // Additional Info
    targetReceiver: text('target_receiver'), // Target Penerima
    notes: text('notes'), // Catatan
    risk: text('risk'), // SDM & Risk analysis

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const actionPlansRelations = relations(actionPlans, ({ one }) => ({
    organization: one(organizations, {
        fields: [actionPlans.orgId],
        references: [organizations.id],
    }),
    creator: one(users, {
        fields: [actionPlans.createdById],
        references: [users.id],
    }),
}));

export type ActionPlan = typeof actionPlans.$inferSelect;
export type NewActionPlan = typeof actionPlans.$inferInsert;

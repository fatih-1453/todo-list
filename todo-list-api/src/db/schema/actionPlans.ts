import { pgTable, text, timestamp, boolean, serial, integer, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';

export const actionPlans = pgTable('action_plans', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    createdById: text('created_by_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // 4DX Framework
    div: text('div'), // Division/Department
    wig: text('wig'), // Wildly Important Goal
    lag: text('lag'), // Lag Measure
    lead: text('lead'), // Lead Measure

    // Content
    plan: text('plan').notNull(), // The actual action plan/activity

    // Meta
    department: text('department'),
    pic: text('pic'), // Person In Charge (text for now, can be linked user later)
    dueDate: timestamp('due_date'),
    startDate: timestamp('start_date'),

    // Metrics (Target)
    targetActivity: integer('target_activity').default(0),
    targetNominal: decimal('target_nominal', { precision: 15, scale: 2 }).default('0'),
    realNominal: decimal('real_nominal', { precision: 15, scale: 2 }).default('0'),
    realActivity: integer('real_activity').default(0), // Realisasi Kegiatan

    // New Fields for Spreadsheet View
    program: text('program'),
    indikator: text('indikator'),
    lokasi: text('lokasi'),
    endDate: timestamp('end_date'),
    targetReceiver: text('target_receiver'), // Target Penerima
    goal: text('goal'), // Tujuan
    position: text('position'), // Jabatan
    subdivisi: text('subdivisi'),
    executingAgency: text('executing_agency'), // Div Pelaksana
    classification: text('classification'), // Klasifikasi Pelaksanaan

    // Weekly Tracking (Evaluation - 0/1 or count)
    evalWeek1: integer('eval_week_1').default(0),
    evalWeek2: integer('eval_week_2').default(0),
    evalWeek3: integer('eval_week_3').default(0),
    evalWeek4: integer('eval_week_4').default(0),

    // Weekly Tracking (Realization - Actual Value)
    realWeek1: text('real_week_1'),
    notes: text('notes'),

    // Analysis
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

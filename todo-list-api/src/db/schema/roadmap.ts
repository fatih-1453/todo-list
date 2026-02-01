import { pgTable, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';

export const roadmapItems = pgTable('roadmap_items', {
    id: serial('id').primaryKey(),
    quarter: text('quarter').notNull(), // e.g., "Q1 '25"
    title: text('title').notNull(), // e.g., "Milestone"
    description: text('description'),
    status: text('status', { enum: ['completed', 'in-progress', 'upcoming'] }).default('upcoming'),
    displayOrder: integer('display_order').default(0),
    color: text('color').default('#000000'), // For the marker color
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type NewRoadmapItem = typeof roadmapItems.$inferInsert;

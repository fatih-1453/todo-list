import { pgTable, text, timestamp, boolean, integer, serial, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { groups } from './groups';

// --- Users ---
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    username: text('username').unique(),
    role: text('role').default('user'),
    wig: text('wig'), // Work Interest Group
    employeeId: integer('employee_id').references(() => employees.id),
    groupId: integer('group_id').references(() => groups.id),
    status: text('status', { enum: ['active', 'inactive'] }).default('active'),
    emailVerified: boolean('email_verified').default(false),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Employees ---
export const employees = pgTable('employees', {
    id: serial('id').primaryKey(),
    orgId: text('org_id').references(() => organizations.id, { onDelete: 'set null' }),

    // Org Details
    department: text('department'),
    position: text('position'),
    location: text('location'), // Penempatan

    // Identity - Top Section
    nip: text('nip'), // Employee ID
    name: text('name').notNull(),
    nickname: text('nickname'),
    frontTitle: text('front_title'),
    backTitle: text('back_title'),

    // Identitas Section
    nik: text('nik'), // National ID
    placeOfBirth: text('place_of_birth'),
    dateOfBirth: date('date_of_birth'),
    gender: text('gender', { enum: ['Laki-laki', 'Perempuan'] }),
    religion: text('religion'),
    phoneNumber: text('phone_number'), // Kontak
    email: text('email'),

    // Alamat Section
    address: text('address'), // Alamat Line 1
    rt: text('rt'),
    rw: text('rw'),
    postalCode: text('postal_code'),
    province: text('province'),
    city: text('city'), // Kabupaten/Kota
    district: text('district'), // Kecamatan
    village: text('village'), // Desa/Kelurahan

    // Metadata
    photoUrl: text('photo_url'),
    joinDate: date('join_date'),
    status: text('status', { enum: ['Active', 'Inactive', 'Leave'] }).default('Active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Organizations ---
export const organizations = pgTable('organizations', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    logo: text('logo'),
    metadata: text('metadata'),
    ownerId: text('owner_id').notNull(),
    status: text('status', { enum: ['active', 'inactive'] }).default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const organizationMembers = pgTable('member', {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('member'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const invitations = pgTable("invitation", {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: text("inviter_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
});

// --- Relations ---

export const usersRelations = relations(users, ({ one }) => ({
    employee: one(employees, {
        fields: [users.employeeId],
        references: [employees.id],
    }),
    group: one(groups, {
        fields: [users.groupId],
        references: [groups.id],
    }),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
    organization: one(organizations, {
        fields: [employees.orgId],
        references: [organizations.id],
    }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
    owner: one(users, {
        fields: [organizations.ownerId],
        references: [users.id],
    }),
    members: many(organizationMembers),
    invitations: many(invitations),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
    organization: one(organizations, {
        fields: [organizationMembers.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [organizationMembers.userId],
        references: [users.id],
    }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    organization: one(organizations, {
        fields: [invitations.organizationId],
        references: [organizations.id],
    }),
    inviter: one(users, {
        fields: [invitations.inviterId],
        references: [users.id],
    }),
}));

// --- Types ---
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

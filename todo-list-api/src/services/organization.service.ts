import { eq, and } from 'drizzle-orm';
import { db } from '../config/database';
import { organizations, organizationMembers, users, NewOrganization, OrganizationMember } from '../db/schema/index';
import { randomUUID } from 'crypto';

export const organizationService = {
    // Create new organization
    async create(data: Omit<NewOrganization, 'id'> & { id?: string }) {
        const id = data.id || randomUUID(); // Generate UUID if not provided
        const [org] = await db.insert(organizations).values({ ...data, id }).returning();

        // Add creator as owner
        await db.insert(organizationMembers).values({
            id: randomUUID(), // member table also needs ID
            organizationId: org.id,
            userId: data.ownerId,
            role: 'Owner'
        });

        return org;
    },

    // Update organization
    async update(orgId: string, data: Partial<NewOrganization>) {
        const [updated] = await db.update(organizations)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(organizations.id, orgId))
            .returning();
        return updated;
    },

    // Get user's organizations
    async getUserOrganizations(userId: string) {
        // First check if user is admin
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (user?.role === 'admin') {
            // Admin gets all organizations
            const allOrgs = await db.select().from(organizations);
            return allOrgs.map(org => ({ ...org, role: 'Admin' }));
        }

        const members = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.userId, userId),
            with: {
                organization: true
            }
        });
        return members.map(m => ({ ...m.organization, role: m.role }));
    },

    // Get organization by ID (if user is member)
    async getById(orgId: string, userId: string) {
        // First check if user is admin
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (user?.role === 'admin') {
            const org = await db.query.organizations.findFirst({
                where: eq(organizations.id, orgId)
            });
            if (!org) return null;
            return { ...org, role: 'Admin' };
        }

        const member = await db.query.organizationMembers.findFirst({
            where: and(
                eq(organizationMembers.organizationId, orgId),
                eq(organizationMembers.userId, userId)
            ),
            with: {
                organization: true
            }
        });

        if (!member) return null;
        return { ...member.organization, role: member.role };
    },

    // Add member to organization
    async addMember(data: Omit<OrganizationMember, 'id' | 'createdAt'>) {
        return await db.insert(organizationMembers).values({
            id: randomUUID(),
            ...data
        }).returning();
    },

    // Get organization members
    async getMembers(orgId: string) {
        const members = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.organizationId, orgId),
            with: {
                user: true
            }
        });
        return members.map(m => ({
            ...m.user,
            role: m.role,
            joinedAt: m.createdAt // Using createdAt as joinedAt
        }));
    }
};


import { db } from '../src/config/database';
import { users, organizations, organizationMembers } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function main() {
    const email = 'iksan@gmail.com';

    console.log(`Searching for user with email: ${email}`);
    const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (foundUsers.length === 0) {
        console.error(`User ${email} not found! Please sign up first.`);
        process.exit(1);
    }

    const user = foundUsers[0];
    console.log(`Found user: ${user.name} (${user.id})`);

    // 1. Promote to global admin
    console.log('Promoting user to global admin...');
    await db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.id, user.id));
    console.log('User promoted to global admin successfully.');

    // 2. Check/Create Admin Organization
    const orgSlug = 'admin-workspace';
    const orgName = 'Admin Workspace';

    console.log(`Checking for organization: ${orgName} (${orgSlug})`);
    const foundOrgs = await db.select().from(organizations).where(eq(organizations.slug, orgSlug)).limit(1);

    let orgId;

    if (foundOrgs.length > 0) {
        console.log('Organization already exists.');
        orgId = foundOrgs[0].id;

        // Ensure ownerId is correct
        await db.update(organizations).set({ ownerId: user.id }).where(eq(organizations.id, orgId));
    } else {
        console.log('Creating Admin Organization...');
        orgId = randomUUID();
        await db.insert(organizations).values({
            id: orgId,
            name: orgName,
            slug: orgSlug,
            ownerId: user.id,
            status: 'active'
        });
        console.log(`Organization created with ID: ${orgId}`);
    }

    // 3. Add user as member (if not already)
    const members = await db.select()
        .from(organizationMembers)
        .where(
            and(
                eq(organizationMembers.organizationId, orgId),
                eq(organizationMembers.userId, user.id)
            )
        );

    if (members.length === 0) {
        console.log('Adding user to organization...');
        await db.insert(organizationMembers).values({
            id: randomUUID(),
            organizationId: orgId,
            userId: user.id,
            role: 'owner'
        });
        console.log('User added to organization as owner.');
    } else {
        console.log('User is already a member. Updating role to owner...');
        await db.update(organizationMembers)
            .set({ role: 'owner' })
            .where(
                and(
                    eq(organizationMembers.organizationId, orgId),
                    eq(organizationMembers.userId, user.id)
                )
            );
        console.log('User role updated to owner.');
    }

    console.log('Setup complete!');
    process.exit(0);
}

main().catch(err => {
    console.error('Error executing script:', err);
    process.exit(1);
});

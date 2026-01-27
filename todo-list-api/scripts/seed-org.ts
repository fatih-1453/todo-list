
import { db } from '../src/config/database';
import { users, organizations, organizationMembers } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Seeding Organization...');

    // 1. Check if we have any users
    const allUsers = await db.query.users.findMany();
    if (allUsers.length === 0) {
        console.log('❌ No users found. Please sign up in the app first.');
        process.exit(1);
    }
    console.log(`✅ Found ${allUsers.length} users.`);

    // 2. Check if we have an organization
    let org = await db.query.organizations.findFirst();

    if (!org) {
        console.log('creating new organization...');
        const [newOrg] = await db.insert(organizations).values({
            name: 'My Default Organization',
            ownerId: allUsers[0].id,
            status: 'active'
        }).returning();
        org = newOrg;
        console.log(`✅ Created organization: ${org.name}`);
    } else {
        console.log(`✅ Found organization: ${org.name}`);
    }

    // 3. Add all users to the organization if not already a member
    for (const user of allUsers) {
        const member = await db.query.organizationMembers.findFirst({
            where: (members, { and, eq }) => and(
                eq(members.orgId, org!.id),
                eq(members.userId, user.id)
            )
        });

        if (!member) {
            console.log(`Adding user ${user.email} to organization...`);
            await db.insert(organizationMembers).values({
                orgId: org!.id,
                userId: user.id,
                role: 'Member'
            });
            console.log(`✅ User ${user.email} added.`);
        } else {
            console.log(`ℹ️ User ${user.email} is already a member.`);
        }
    }

    console.log('🌱 Application Data Seeded!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});

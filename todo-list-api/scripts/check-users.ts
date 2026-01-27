import 'dotenv/config';
import { db } from '../src/config/database';
import { users, groups, organizationMembers, organizations } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function check() {
    console.log('=== CHECKING DATABASE USERS ===\n');

    // Get all users with their groups
    const allUsers = await db.query.users.findMany({
        with: {
            group: true
        }
    });

    console.log('--- USERS TABLE ---');
    for (const u of allUsers) {
        console.log(`\nEmail: ${u.email}`);
        console.log(`  Name: ${u.name}`);
        console.log(`  Role: ${u.role || 'NOT SET'}`);
        console.log(`  GroupId: ${u.groupId || 'NULL'}`);
        if (u.group) {
            console.log(`  Group Name: ${u.group.name}`);
            console.log(`  Permissions: ${JSON.stringify(u.group.permissions)}`);
        } else {
            console.log(`  Group: NOT ASSIGNED`);
        }
    }

    // Check organization memberships
    console.log('\n--- ORGANIZATION MEMBERS ---');
    const members = await db.query.organizationMembers.findMany({
        with: {
            user: true,
            organization: true
        }
    });

    for (const m of members) {
        console.log(`${m.user?.email} -> Org: ${m.organization?.name} (Role: ${m.role})`);
    }

    // Check all groups
    console.log('\n--- ALL GROUPS ---');
    const allGroups = await db.query.groups.findMany();
    for (const g of allGroups) {
        console.log(`ID: ${g.id}, Name: ${g.name}`);
        console.log(`  Permissions: ${JSON.stringify(g.permissions)}`);
    }

    process.exit(0);
}

check().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

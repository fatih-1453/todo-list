
import { db } from '../src/config/database';
import { users, organizations, tasks, reminders, organizationMembers } from '../src/db/schema/index';
import { eq, isNull } from 'drizzle-orm';
import { organizationService } from '../src/services/organization.service';

async function migrate() {
    console.log('Starting migration...');

    // 1. Get all users
    const allUsers = await db.query.users.findMany();

    for (const user of allUsers) {
        console.log(`Processing user: ${user.email}`);

        // 2. Check if they have any organization
        const userOrgs = await organizationService.getUserOrganizations(user.id);

        let personalOrgId: number;

        if (userOrgs.length === 0) {
            console.log(`Creating Personal Workspace for ${user.email}...`);
            const org = await organizationService.create({
                name: `${user.name}'s Workspace`,
                ownerId: user.id
            });
            personalOrgId = org.id;
        } else {
            console.log(`User already has workspace: ${userOrgs[0].name}`);
            personalOrgId = userOrgs[0].id; // Assign to first org
        }

        // 3. Migrate Tasks
        // Find tasks for this user that don't have orgId
        const userTasks = await db.query.tasks.findMany({
            where: eq(tasks.userId, user.id)
        });

        const tasksToUpdate = userTasks.filter(t => !t.orgId);
        if (tasksToUpdate.length > 0) {
            console.log(`Migrating ${tasksToUpdate.length} tasks...`);
            await db.update(tasks)
                .set({ orgId: personalOrgId })
                .where(eq(tasks.userId, user.id));
        }

        // 4. Migrate Reminders
        const userReminders = await db.query.reminders.findMany({
            where: eq(reminders.userId, user.id)
        });

        const remindersToUpdate = userReminders.filter(r => !r.orgId);
        if (remindersToUpdate.length > 0) {
            console.log(`Migrating ${remindersToUpdate.length} reminders...`);
            await db.update(reminders)
                .set({ orgId: personalOrgId })
                .where(eq(reminders.userId, user.id));
        }
    }

    console.log('Migration complete!');
    process.exit(0);
}

migrate().catch(console.error);

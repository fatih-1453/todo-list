import 'dotenv/config';
import { db } from '../src/config/database';
import { employees, organizations, organizationMembers, users } from '../src/db/schema';

async function check() {
    console.log('=== ALL EMPLOYEES ===');
    const emps = await db.query.employees.findMany();
    if (emps.length === 0) {
        console.log('NO EMPLOYEES IN DATABASE!');
    } else {
        emps.forEach(e => console.log(`ID:${e.id} Name:${e.name} OrgId:${e.orgId}`));
    }
    console.log('Total employees:', emps.length);

    console.log('\n=== ALL ORGANIZATIONS ===');
    const orgs = await db.query.organizations.findMany();
    orgs.forEach(o => console.log(`ID:${o.id} Name:${o.name}`));
    console.log('Total orgs:', orgs.length);

    console.log('\n=== USERS AND THEIR ACTIVE ORG ===');
    const members = await db.query.organizationMembers.findMany({
        with: { user: true, organization: true }
    });

    // Group by user
    const userOrgs: Record<string, string[]> = {};
    members.forEach(m => {
        if (m.user?.email) {
            if (!userOrgs[m.user.email]) userOrgs[m.user.email] = [];
            userOrgs[m.user.email].push(`${m.organization?.name}(ID:${m.orgId})`);
        }
    });

    for (const [email, orgs] of Object.entries(userOrgs)) {
        console.log(`${email}:`);
        console.log(`  Active Org (first): ${orgs[0]}`);
        console.log(`  All Orgs: ${orgs.join(', ')}`);
    }

    console.log('\n=== EMPLOYEES BY ORG ===');
    for (const org of await db.query.organizations.findMany()) {
        const orgEmps = emps.filter(e => e.orgId === org.id);
        console.log(`Org ${org.id} (${org.name}): ${orgEmps.length} employees`);
    }

    process.exit(0);
}

check().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

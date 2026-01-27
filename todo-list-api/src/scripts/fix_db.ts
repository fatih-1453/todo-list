import 'dotenv/config';
import { db } from '../config/database';
import { sql } from 'drizzle-orm';

async function run() {
    const tables = [
        'organizations',
        'organization_members',
        'invitation',
        'employees',
        'tasks',
        'targets',
        'reminders',
        'programs',
        'positions',
        'performance_stats',
        'folders',
        'files',
        'departments',
        'big_data',
        'assessments',
        'action_plans'
    ];

    for (const table of tables) {
        try {
            await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
            console.log(`Dropped ${table}.`);
        } catch (e: any) {
            console.log(`Error dropping ${table}:`, e.message);
        }
    }

    process.exit(0);
}

run();

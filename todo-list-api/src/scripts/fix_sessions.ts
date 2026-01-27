import 'dotenv/config';
import { db } from '../config/database';
import { sql } from 'drizzle-orm';

async function run() {
    console.log('Truncating sessions...');
    try {
        await db.execute(sql`TRUNCATE TABLE sessions CASCADE`);
        console.log('Truncated sessions (Forced Logout).');
    } catch (e: any) {
        console.log('Error truncating sessions:', e.message);
    }
    process.exit(0);
}

run();

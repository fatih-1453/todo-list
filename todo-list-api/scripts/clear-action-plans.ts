import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { actionPlans } from '../src/db/schema/actionPlans';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function clearActionPlans() {
    console.log('Deleting all action_plans data...');
    const result = await db.delete(actionPlans);
    console.log('Done! All action_plans data has been cleared.');
    await pool.end();
}

clearActionPlans().catch(console.error);

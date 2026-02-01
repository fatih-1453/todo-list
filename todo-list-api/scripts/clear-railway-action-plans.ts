import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { actionPlans } from '../src/db/schema/actionPlans';

// Railway Public Database URL
const RAILWAY_DB_URL = 'postgresql://postgres:wxgtaUbSRhaGxCZfQXgalYdyGBAXHWAq@switchyard.proxy.rlwy.net:49274/railway';

const pool = new Pool({
    connectionString: RAILWAY_DB_URL,
    ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function clearActionPlans() {
    console.log('Connecting to Railway database...');
    console.log('Deleting all action_plans data from PRODUCTION...');
    const result = await db.delete(actionPlans);
    console.log('Done! All action_plans data has been cleared from Railway.');
    await pool.end();
}

clearActionPlans().catch(console.error);

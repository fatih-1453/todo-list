import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('Dropping table action_plans...');
    try {
        await pool.query('DROP TABLE IF EXISTS "action_plans" CASCADE;');
        console.log('Table action_plans dropped successfully.');
    } catch (error) {
        console.error('Error dropping table:', error);
    } finally {
        await pool.end();
    }
}

main();

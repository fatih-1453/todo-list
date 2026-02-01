import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('Syncing action_plans sequence...');
    try {
        // dynamic sequence name usually table_column_seq
        const result = await pool.query(`
            SELECT setval(pg_get_serial_sequence('action_plans', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM action_plans;
        `);
        console.log('Sequence synced successfully:', result.rows[0]);
    } catch (error) {
        console.error('Error syncing sequence:', error);
    } finally {
        await pool.end();
    }
}

main();

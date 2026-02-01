import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('Inspecting action_plans columns...');
    try {
        const tableCheck = await pool.query(`
            SELECT table_name FROM information_schema.tables WHERE table_name = 'action_plans';
        `);
        console.log('Table exists:', tableCheck.rows.length > 0);

        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'action_plans';
        `);
        console.log('Columns found:', res.rows.length);
        res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

main();

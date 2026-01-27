import { db } from './src/config/database';
import { sql } from 'drizzle-orm';

async function checkColumns() {
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'action_plans';
        `);
        console.log("Columns in action_plans:", result.rows);
    } catch (error) {
        console.error("Error checking columns:", error);
    }
    process.exit(0);
}

checkColumns();

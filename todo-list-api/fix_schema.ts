import { db } from './src/config/database';
import { sql } from 'drizzle-orm';

async function fixSchema() {
    try {
        console.log("Adding notes column...");
        await db.execute(sql`ALTER TABLE action_plans ADD COLUMN IF NOT EXISTS notes text;`);

        console.log("Adding real_nominal column...");
        await db.execute(sql`ALTER TABLE action_plans ADD COLUMN IF NOT EXISTS real_nominal numeric(15, 2) DEFAULT 0;`);

        console.log("Dropping real_week_2...");
        await db.execute(sql`ALTER TABLE action_plans DROP COLUMN IF EXISTS real_week_2;`);

        console.log("Dropping real_week_3...");
        await db.execute(sql`ALTER TABLE action_plans DROP COLUMN IF EXISTS real_week_3;`);

        console.log("Dropping real_week_4...");
        await db.execute(sql`ALTER TABLE action_plans DROP COLUMN IF EXISTS real_week_4;`);

        console.log("Schema fixed successfully.");
    } catch (error) {
        console.error("Error fixing schema:", error);
    }
    process.exit(0);
}

fixSchema();

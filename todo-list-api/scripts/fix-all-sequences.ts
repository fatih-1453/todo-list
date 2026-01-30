
import { db } from '../src/config/database';
import { sql } from 'drizzle-orm';

async function fixAllSequences() {
    console.log('🔧 Starting Global Sequence Fix...');

    try {
        // 1. Get all sequences and their associated tables/columns
        const sequences = await db.execute(sql`
            SELECT 
                t.table_schema,
                t.table_name,
                c.column_name,
                pg_get_serial_sequence(t.table_name, c.column_name) as sequence_name
            FROM information_schema.columns c
            JOIN information_schema.tables t ON c.table_name = t.table_name
            WHERE c.column_default LIKE 'nextval%'
            AND t.table_schema = 'public';
        `);

        if (sequences.rows.length === 0) {
            console.log('⚠️ No sequences found.');
            process.exit(0);
        }

        console.log(`Found ${sequences.rows.length} sequences to check.`);

        for (const row of sequences.rows) {
            const tableName = row.table_name as string;
            const columnName = row.column_name as string;
            const sequenceName = row.sequence_name as string;

            if (!sequenceName) {
                console.log(`⚠️ Could not determine sequence for ${tableName}.${columnName}`);
                continue;
            }

            // 2. Reset sequence for each table
            try {
                // Get max id
                const maxIdResult = await db.execute(sql.raw(`SELECT MAX("${columnName}") FROM "${tableName}"`));
                const maxId = maxIdResult.rows[0].max;
                const nextVal = (Number(maxId) || 0) + 1;

                // Set sequence
                await db.execute(sql.raw(`SELECT setval('${sequenceName}', ${nextVal}, false)`));
                console.log(`✅ Fixed ${tableName}.${columnName} (Sequence: ${sequenceName}) -> Next Value: ${nextVal}`);
            } catch (err) {
                console.error(`❌ Failed to fix ${tableName}.${columnName}:`, err);
            }
        }

        console.log('✨ Global Sequence Fix Completed!');

    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

fixAllSequences();

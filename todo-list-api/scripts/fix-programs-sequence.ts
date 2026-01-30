
import { db } from '../src/config/database';
import { sql } from 'drizzle-orm';

async function fixSequence() {
    console.log('🔧 Fixing programs table sequence...');

    try {
        // Reset the sequence to the maximum id in the programs table
        // This ensures the next inserted id will be max(id) + 1
        await db.execute(sql`SELECT setval('programs_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM programs), false);`);

        console.log('✅ Sequence fixed!');
    } catch (error) {
        console.error('❌ Failed to fix sequence:', error);
    }

    process.exit(0);
}

fixSequence();

import { Pool } from 'pg';

// Railway Database URL
const RAILWAY_DB_URL = 'postgresql://postgres:wxgtaUbSRhaGxCZfQXgalYdyGBAXHWAq@switchyard.proxy.rlwy.net:49274/railway';

const pool = new Pool({
    connectionString: RAILWAY_DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrateActionPlans() {
    const client = await pool.connect();

    try {
        console.log('🔧 Starting migration...');

        // Check if notes column exists (to rename to output)
        const notesCheck = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'action_plans' AND column_name = 'notes'
        `);

        if (notesCheck.rows.length > 0) {
            console.log('📝 Renaming notes → output...');
            await client.query('ALTER TABLE action_plans RENAME COLUMN notes TO output');
            console.log('✅ Renamed notes to output');
        } else {
            console.log('ℹ️  notes column not found (may already be renamed)');

            // Check if output already exists
            const outputCheck = await client.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'action_plans' AND column_name = 'output'
            `);

            if (outputCheck.rows.length === 0) {
                console.log('📝 Creating output column...');
                await client.query('ALTER TABLE action_plans ADD COLUMN output TEXT');
                console.log('✅ Created output column');
            } else {
                console.log('ℹ️  output column already exists');
            }
        }

        // Check if due_date column exists (to drop)
        const dueDateCheck = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'action_plans' AND column_name = 'due_date'
        `);

        if (dueDateCheck.rows.length > 0) {
            console.log('🗑️  Dropping due_date column...');
            await client.query('ALTER TABLE action_plans DROP COLUMN due_date');
            console.log('✅ Dropped due_date column');
        } else {
            console.log('ℹ️  due_date column not found (already dropped)');
        }

        console.log('\n🎉 Migration completed successfully!');

        // Show current columns
        const columns = await client.query(`
            SELECT column_name, data_type FROM information_schema.columns 
            WHERE table_name = 'action_plans' ORDER BY ordinal_position
        `);
        console.log('\n📋 Current columns:');
        columns.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateActionPlans();

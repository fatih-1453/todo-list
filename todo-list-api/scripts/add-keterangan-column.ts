import { Pool } from 'pg';

// Railway Database URL
const RAILWAY_DB_URL = 'postgresql://postgres:wxgtaUbSRhaGxCZfQXgalYdyGBAXHWAq@switchyard.proxy.rlwy.net:49274/railway';

const pool = new Pool({
    connectionString: RAILWAY_DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function addKeteranganColumn() {
    const client = await pool.connect();

    try {
        console.log('🔧 Adding keterangan column to action_plans...');

        // Check if keterangan column exists
        const checkColumn = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'action_plans' AND column_name = 'keterangan'
        `);

        if (checkColumn.rows.length === 0) {
            await client.query('ALTER TABLE action_plans ADD COLUMN keterangan TEXT');
            console.log('✅ Added keterangan column');
        } else {
            console.log('ℹ️  keterangan column already exists');
        }

        console.log('\n🎉 Migration completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addKeteranganColumn();

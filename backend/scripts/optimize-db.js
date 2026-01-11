
import pg from 'pg';
import '../env.js';

const { Pool } = pg;

const connectionString = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_EadveAG2U1LY@ep-purple-night-ah42kru5-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

if (!connectionString) {
    console.error('❌ POSTGRES_URL is not defined.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function optimizeDB() {
    console.log('⚡ Optimizing Database Schema...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Index for Wallet Lookups (Sent/Received History)
        // IF NOT EXISTS is not directly supported for CREATE INDEX in all PG versions, 
        // but we can wrap in try/catch or use a DO block. standard PG supports IF NOT EXISTS in newer versions.
        // We will use standard CREATE INDEX IF NOT EXISTS.

        await client.query(`CREATE INDEX IF NOT EXISTS idx_invoices_from_wallet ON invoices(LOWER("fromWallet"));`);
        console.log('✅ Index created: idx_invoices_from_wallet');

        await client.query(`CREATE INDEX IF NOT EXISTS idx_invoices_recipient_wallet ON invoices(LOWER("recipientWallet"));`);
        console.log('✅ Index created: idx_invoices_recipient_wallet');

        // 2. Index for Sorting (Date)
        await client.query(`CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices("createdAt" DESC);`);
        console.log('✅ Index created: idx_invoices_created_at');

        // 3. Index for Status (Filtering Pending/Expired)
        await client.query(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);`);
        console.log('✅ Index created: idx_invoices_status');

        await client.query('COMMIT');
        console.log('🚀 Database optimization complete.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Optimization failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

optimizeDB();

import pg from 'pg';
const { Client } = pg;

// Use the production connection string
const connectionString = 'postgresql://neondb_owner:npg_EadveAG2U1LY@ep-purple-night-ah42kru5-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({ connectionString });

async function main() {
    await client.connect();

    console.log('💧 Checking Faucet Schema...');

    await client.query(`
    CREATE TABLE IF NOT EXISTS faucet_claims (
        wallet_address TEXT NOT NULL,
        ip_address TEXT,
        amount TEXT,
        tx_hash TEXT,
        claimed_at BIGINT
    );
  `);

    console.log('✅ Faucet Tables Ready!');
    await client.end();
}

main().catch(console.error);

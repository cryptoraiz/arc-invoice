import pg from 'pg';
const { Client } = pg;

// Use the production connection string
const connectionString = 'postgresql://neondb_owner:npg_EadveAG2U1LY@ep-purple-night-ah42kru5-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({ connectionString });

async function main() {
    await client.connect();

    console.log('🗑️  Resetting Faucet Stats...');

    await client.query(`DELETE FROM faucet_claims;`);

    console.log('✅ Faucet Stats Cleared (Table is empty)!');
    await client.end();
}

main().catch(console.error);

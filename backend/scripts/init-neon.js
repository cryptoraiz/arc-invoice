import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_EadveAG2U1LY@ep-purple-night-ah42kru5-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
    connectionString,
});

async function main() {
    await client.connect();

    await client.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      "fromWallet" TEXT NOT NULL,
      "recipientWallet" TEXT NOT NULL,
      "recipientName" TEXT,
      amount NUMERIC NOT NULL,
      currency TEXT DEFAULT 'USDC',
      status TEXT DEFAULT 'pending',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "paidAt" TIMESTAMP
    );
  `);

    console.log('✅ Table "invoices" created successfully in Neon!');
    await client.end();
}

main().catch(console.error);

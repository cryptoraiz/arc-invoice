
import pg from 'pg';
const { Client } = pg;

// Hardcoded for initialization
const connectionString = 'postgresql://neondb_owner:npg_EadveAG2U1LY@ep-purple-night-ah42kru5-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    await client.connect();
    console.log('Connected to Neon DB...');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(255) PRIMARY KEY,
        "fromWallet" VARCHAR(255),
        "recipientWallet" VARCHAR(255),
        "recipientName" VARCHAR(255),
        amount NUMERIC,
        currency VARCHAR(10),
        description TEXT,
        status VARCHAR(50),
        "createdAt" BIGINT,
        "updatedAt" BIGINT,
        "txHash" VARCHAR(255),
        "payer" VARCHAR(255),
        "paidAt" BIGINT
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ Table "invoices" created successfully!');

    // Check if table exists
    const res = await client.query("SELECT * FROM invoices LIMIT 1");
    console.log('Test Select:', res.rowCount, 'rows');

  } catch (err) {
    console.error('❌ Error initializing DB:', err);
  } finally {
    await client.end();
  }
}

initDB();

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:nOQwVM1qHth8@ep-hidden-heart-a5d6ofok.us-east-2.aws.neon.tech/neondb?sslmode=require'
});
async function main() {
  try {
    const res = await pool.query('SELECT * FROM faucet_claims LIMIT 5');
    console.log('Neon faucet_claims:', res.rows);
    const countRes = await pool.query('SELECT COUNT(*) as claims, COUNT(DISTINCT wallet_address) as unique_wallets, COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total_distributed FROM faucet_claims');
    console.log('Stats:', countRes.rows[0]);
  } catch(e) { console.error('Error:', e.message); }
  process.exit(0);
}
main();

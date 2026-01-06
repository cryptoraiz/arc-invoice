import pg from 'pg';
const { Pool } = pg;

// Use POSTGRES_URL from environment variables (standard for Vercel/Railway)
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.warn('⚠️ POSTGRES_URL not set. Database features will fail.');
}

// Create a new pool using the connection string
// SSL is usually required for cloud databases (Neon, Railway, Vercel)

// FIX: Force BigInt (OID 20) to be parsed as Number in JS
// This fixes "NaN" dates because pg by default returns BigInt as string
pg.types.setTypeParser(20, (val) => parseInt(val, 10));

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = {
    /**
     * Helper to run queries
     */
    async query(text, params) {
        return pool.query(text, params);
    },

    async getAll() {
        const res = await this.query('SELECT * FROM invoices ORDER BY "createdAt" DESC');
        return res.rows;
    },

    async add(invoice) {
        const query = `
            INSERT INTO invoices (
                id, "fromWallet", "recipientWallet", "recipientName", 
                amount, currency, description, status, "createdAt", "updatedAt"
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            invoice.id,
            invoice.fromWallet,
            invoice.recipientWallet,
            invoice.recipientName,
            invoice.amount,
            invoice.currency,
            invoice.description,
            invoice.status,
            invoice.createdAt, // Assumes BigInt or numeric timestamp
            invoice.updatedAt || null
        ];

        const res = await this.query(query, values);
        return res.rows[0];
    },

    async findById(id) {
        const res = await this.query('SELECT * FROM invoices WHERE id = $1', [id]);
        return res.rows[0] || null;
    },

    async findByWallet(wallet) {
        // Find invoices where wallet is Creator (fromWallet) OR Recipient (recipientWallet)
        // Adjust logic based on needs. Original was fromWallet.
        const res = await this.query(
            'SELECT * FROM invoices WHERE LOWER("fromWallet") = LOWER($1) ORDER BY "createdAt" DESC',
            [wallet]
        );
        return res.rows;
    },

    async updateStatus(id, status, additionalFields = {}) {
        // Construct dynamic update query
        const fields = ['status = $2', '"updatedAt" = $3'];
        const values = [id, status, Date.now()];
        let paramIndex = 4;

        // Add additional fields dynamically
        Object.keys(additionalFields).forEach(key => {
            // Map keys to columns safe names if needed, usually they match
            fields.push(`"${key}" = $${paramIndex}`);
            values.push(additionalFields[key]);
            paramIndex++;
        });

        const query = `
            UPDATE invoices 
            SET ${fields.join(', ')} 
            WHERE id = $1 
            RETURNING *
        `;

        const res = await this.query(query, values);
        return res.rows[0] || null;
    },

    async deleteByWallet(wallet) {
        const query = 'DELETE FROM invoices WHERE LOWER("fromWallet") = LOWER($1) OR LOWER("recipientWallet") = LOWER($1)';
        const res = await this.query(query, [wallet]);
        return res.rowCount; // Returns number of deleted rows
    }
};

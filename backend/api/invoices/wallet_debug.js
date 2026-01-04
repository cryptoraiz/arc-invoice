import { getInvoicesCollection } from '../../lib/mongodb.js';

console.log('✅ NEW FILE LOADED: wallet_debug.js');

/**
 * GET /api/invoices/[wallet]
 * Get all invoices for a specific wallet address (as recipient)
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🚨 DEBUG REQUEST:', req.url);

        // Robust param retrieval
        const wallet = req.query.wallet || (req.params && req.params.wallet);

        if (!wallet) {
            console.error('❌ WALLET MISSING. Params:', req.params, 'Query:', req.query);
            return res.status(400).json({
                error: 'Wallet address required',
                debug: {
                    params: req.params,
                    query: req.query,
                    url: req.url
                }
            });
        }

        const { db } = await import('../../lib/store.js');

        console.log(`🔍 Searching invoices for wallet: ${wallet}`);
        const invoices = await db.findByWallet(wallet);
        console.log(`✅ Found ${invoices.length} invoices`);

        res.status(200).json({
            success: true,
            count: invoices.length,
            invoices: invoices
        });

    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

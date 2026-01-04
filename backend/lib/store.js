import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'invoices.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure file exists
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]));
}

export const db = {
    async getAll() {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(data || '[]');
    },

    async add(invoice) {
        const invoices = await this.getAll();
        invoices.push(invoice);
        fs.writeFileSync(FILE_PATH, JSON.stringify(invoices, null, 2));
        return invoice;
    },

    async findById(id) {
        const invoices = await this.getAll();
        return invoices.find(inv => inv.id === id) || null;
    },

    async findByWallet(wallet) {
        const invoices = await this.getAll();
        // Find invoices created BY this wallet (where they are the receiver of payment)
        return invoices.filter(inv => inv.fromWallet?.toLowerCase() === wallet.toLowerCase());
    },

    async updateStatus(id, status, additionalFields = {}) {
        const invoices = await this.getAll();
        const index = invoices.findIndex(inv => inv.id === id);
        if (index !== -1) {
            invoices[index].status = status;
            invoices[index].updatedAt = Date.now();

            // Merge additional fields (txHash, payer, paidAt, etc.)
            Object.assign(invoices[index], additionalFields);

            fs.writeFileSync(FILE_PATH, JSON.stringify(invoices, null, 2));
            return invoices[index];
        }
        return null;
    },

    async deleteByWallet(wallet) {
        const invoices = await this.getAll();
        const initialCount = invoices.length;
        const normalizedWallet = wallet.toLowerCase();

        const filtered = invoices.filter(inv =>
            (inv.fromWallet?.toLowerCase() !== normalizedWallet) &&
            (inv.recipientWallet?.toLowerCase() !== normalizedWallet)
        );

        if (initialCount !== filtered.length) {
            fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2));
        }

        return initialCount - filtered.length;
    }
};

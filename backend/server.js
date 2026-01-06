import './env.js'; // MUST BE FIRST
import express from 'express';
import cors from 'cors';
import createInvoice from './api/invoices/create.js';
import getInvoices from './api/invoices/wallet.js';
import getInvoiceById from './api/invoices/get.js';
import deleteInvoice from './api/invoices/delete.js';
import updateInvoice from './api/invoices/update.js';
import { faucetHandler, faucetStatsHandler } from './api/faucet.js';

console.log('🔥 SERVER.JS RELOADED! Faucet Active.');

const app = express();
const port = process.env.PORT || 5000; // Alterado para 5000 para liberar a 3000 para o Frontend

// Middleware
app.use(cors());
app.use(express.json());

// Adapter para funções Vercel rodarem no Express
const adapt = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

// Rotas
app.post('/api/invoices/create', adapt(createInvoice));
app.get('/api/invoices/get', adapt(getInvoiceById)); // Specific route first
app.get('/api/invoices/:wallet', adapt(getInvoices));
app.delete('/api/invoices/:wallet', adapt(deleteInvoice));
app.post('/api/invoices/update', adapt(updateInvoice));
app.post('/api/faucet', adapt(faucetHandler));
app.get('/api/faucet/stats', adapt(faucetStatsHandler));

// Health check
app.get('/', (req, res) => {
  res.send('✅ Arc Invoice Backend is running!');
});

app.listen(port, () => {
  console.log(`
🚀 Server running at http://localhost:${port}
🐘 PostgreSQL: ${process.env.POSTGRES_URL ? 'Configured ✅' : 'Missing ❌'}
  `);
});

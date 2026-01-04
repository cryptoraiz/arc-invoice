# ArcPay Backend

Backend serverless para notificações de invoices usando Vercel Functions + MongoDB.

## 🚀 Setup

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar MongoDB

1. Crie uma conta gratuita no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster M0 (grátis)
3. Copie a connection string
4. Crie um arquivo `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arcpay?retryWrites=true&w=majority
```

### 3. Rodar localmente

```bash
npm run dev
```

Vai rodar em `http://localhost:3000`

### 4. Deploy para Vercel

```bash
npm run deploy
```

## 📋 API Endpoints

### POST `/api/invoices/create`
Criar um novo invoice

**Body:**
```json
{
  "id": "uuid-v4",
  "fromWallet": "0xabc...",
  "recipientWallet": "0x123...",
  "recipientName": "João Silva",
  "amount": "100",
  "currency": "USDC",
  "description": "Pagamento do projeto"
}
```

### GET `/api/invoices/[wallet]`
Buscar invoices para uma carteira

**Exemplo:**
```
GET /api/invoices/0x123...
```

### PATCH `/api/invoices/update`
Atualizar status do invoice

**Body:**
```json
{
  "id": "uuid-v4",
  "status": "paid",
  "txHash": "0xtx...",
  "payer": "0xpayer..."
}
```

## 🔒 Variáveis de Ambiente

- `MONGODB_URI`: Connection string do MongoDB Atlas

## 📦 Estrutura

```
backend/
├── api/
│   └── invoices/
│       ├── create.js      # POST criar invoice
│       ├── [wallet].js    # GET buscar invoices
│       └── update.js      # PATCH atualizar status
├── lib/
│   └── mongodb.js         # MongoDB connection
├── package.json
├── vercel.json            # Vercel config
└── README.md
```

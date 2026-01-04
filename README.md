# 🔗 Arc Invoice - Payment Links para USDC & EURC

> Links de pagamento profissionais na Arc Network. Crie, compartilhe, receba.

[![Arc Network](https://img.shields.io/badge/Built%20on-Arc%20Network-blue)](https://arc.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Problema

Receber pagamentos em cripto é complicado:
- ❌ Copiar/colar endereços de wallet (erros comuns)
- ❌ Cliente não sabe quanto pagar
- ❌ Sem contexto sobre o pagamento
- ❌ UX terrível para não-cripto-nativos

---

## 💡 Solução

Arc Invoice cria **payment links profissionais** que:
- ✅ Cliente clica e vê página bonita
- ✅ Valor, descrição e QR Code visíveis
- ✅ Conecta wallet e paga em 2 clicks
- ✅ Você recebe USDC/EURC em < 1 segundo

---

## 🚀 Tech Stack

### **Frontend:**
- React 18
- Vite
- Tailwind CSS
- Wagmi + Viem (Web3)
- Headless UI (dropdown customizado)
- Framer Motion (animações)
- React QR Code

### **Backend:**
- Node.js + Express
- MongoDB (Serverless) (Implementado)

### **Blockchain:**
- Arc Network Testnet
- USDC/EURC (Circle)
- Solidity 0.8.x

---

## 📦 Instalação

### **1. Clone o repositório:**
```bash
git clone https://github.com/seu-user/arc-invoice.git
cd arc-invoice/frontend
```

### **2. Instale dependências:**
```bash
npm install
```

### **3. Configure variáveis de ambiente:**
```bash
cp .env.example .env
```
Edite `.env` com suas chaves.

### **4. Rode o projeto:**
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📁 Estrutura do Projeto

```
arc-invoice/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── forms/          # PaymentForm
│   │   │   └── ui/             # FaucetModal, Button
│   │   ├── pages/              # PayPage, HistoryPage
│   │   ├── config/             # wagmi.js
│   │   ├── hooks/              # useInvoiceNotifications
│   │   ├── utils/              # localStorage.js
│   │   └── styles/             # globals.css
│   ├── index.html
│   └── package.json
└── backend/
    ├── server.js               # API Server
    └── package.json
```

---

## 🌐 Deploy

### **Frontend (Vercel):**
```bash
cd frontend
vercel deploy
```

---

## 📝 Status
- [x] Deploy smart contract na Arc Testnet
- [x] Integrar Wagmi para wallet connection
- [x] Implementar funcionalidade de gerar links
- [x] Criar backend Node.js + MongoDB
- [x] Histórico de pagamentos
- [x] Notificações em tempo real

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

MIT © 2025 Arc Invoice

---

## 🙏 Agradecimentos

- **Arc Network** - Blockchain para pagamentos
- **Circle** - USDC/EURC stablecoins

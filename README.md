# 🔗 ArcPay - Payment Links para USDC & EURC

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

ArcPay cria **payment links profissionais** que:
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

### **Backend (futuro):**
- Node.js + Express
- PostgreSQL + Prisma
- JWT Auth

### **Blockchain:**
- Arc Network Testnet
- USDC/EURC (Circle)
- Solidity 0.8.x

---

## 📦 Instalação

### **1. Clone o repositório:**
```bash
git clone https://github.com/seu-user/arcpay.git
cd arcpay/arcpay-react
```

### **2. Instale dependências do frontend:**
```bash
cd frontend
npm install
```

### **3. Configure variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite `.env` e adicione:
```env
VITE_CONTRACT_ADDRESS=0x...  # Endereço do seu contrato deployado
VITE_ARC_RPC_URL=https://rpc.arc.network
```

### **4. Rode o projeto:**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
arcpay-react/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer, Layout
│   │   │   ├── forms/          # PaymentForm
│   │   │   └── ui/             # CurrencySelect, Button
│   │   ├── pages/              # HomePage, FAQ, ComoFunciona
│   │   ├── config/             # wagmi.js (Arc Network)
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Helpers
│   │   └── styles/             # globals.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── backend/ (futuro)
```

---

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Roda em modo desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Lint com ESLint
```

---

## 🌐 Deploy

### **Frontend (Vercel):**
```bash
cd frontend
vercel deploy
```

### **Backend (futuro):**
```bash
cd backend
npm run build
npm start
```

---

## 🎨 Componentes Principais

### **CurrencySelect (dropdown customizado):**
```jsx
import CurrencySelect from '@/components/ui/CurrencySelect'

<CurrencySelect 
  value={currency} 
  onChange={(newCurrency) => setCurrency(newCurrency)} 
/>
```

### **PaymentForm:**
```jsx
import PaymentForm from '@/components/forms/PaymentForm'

<PaymentForm />
```

---

## 🔗 Links Úteis

- [Arc Network](https://arc.network)
- [Circle (USDC/EURC)](https://circle.com)
- [Wagmi Docs](https://wagmi.sh)
- [Headless UI](https://headlessui.com)

---

## 📝 TODO

### **🔴 CRÍTICO (fazer primeiro):**
- [ ] Deploy smart contract na Arc Testnet
- [ ] Integrar Wagmi para wallet connection
- [ ] Implementar funcionalidade de gerar links
- [ ] Criar backend Node.js + PostgreSQL

### **🟡 IMPORTANTE:**
- [ ] Migrar conteúdo de `como-funciona.html` para React
- [ ] Migrar conteúdo de `faq.html` para React
- [ ] Implementar QR Code funcional
- [ ] Validação de formulários

### **🟢 MELHORIAS:**
- [ ] Histórico de pagamentos
- [ ] Notificações (email/webhook)
- [ ] Multi-idioma (PT/EN/ES)
- [ ] Dashboard de analytics

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

MIT © 2025 ArcPay

---

## 👨‍💻 Autor

**Dan** - [GitHub](https://github.com/seu-user)

---

## 🙏 Agradecimentos

- **Arc Network** - Blockchain para pagamentos
- **Circle** - USDC/EURC stablecoins
- **Anthropic** - Assistência no desenvolvimento

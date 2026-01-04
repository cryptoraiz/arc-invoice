# 📦 Guia de Instalação - ArcPay

## ⚡ Quick Start (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-user/arcpay.git
cd arcpay/arcpay-react/frontend

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env e adicione seu contract address

# 4. Rode o projeto
npm run dev
```

Acesse: **http://localhost:3000** 🎉

---

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

### Verificar versões:
```bash
node --version  # deve ser >= 18
npm --version   # deve ser >= 9
```

---

## 🔧 Instalação Detalhada

### **1. Clone o Repositório**
```bash
git clone https://github.com/seu-user/arcpay.git
cd arcpay/arcpay-react
```

### **2. Instale Dependências do Frontend**
```bash
cd frontend
npm install
```

**Dependências instaladas:**
- React 18
- Vite
- Tailwind CSS
- Wagmi + Viem
- Headless UI
- React Router
- Framer Motion
- React QR Code

### **3. Configure Variáveis de Ambiente**

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite `.env` e preencha:
```env
VITE_CONTRACT_ADDRESS=0xSEU_CONTRATO_AQUI
VITE_ARC_RPC_URL=https://rpc.arc.network
VITE_CHAIN_ID=111111
```

**Onde encontrar essas informações:**
- **CONTRACT_ADDRESS**: Após fazer deploy do smart contract
- **ARC_RPC_URL**: Documentação da Arc Network
- **CHAIN_ID**: Documentação da Arc Network

### **4. Rode o Projeto**

```bash
npm run dev
```

O projeto estará disponível em:
- **Local**: http://localhost:3000
- **Network**: http://seu-ip:3000

---

## 🚀 Build para Produção

```bash
# Build
npm run build

# Preview da build
npm run preview
```

Arquivos gerados em: `dist/`

---

## 📁 Estrutura Após Instalação

```
arcpay-react/
├── frontend/
│   ├── node_modules/        # ✅ Dependências instaladas
│   ├── src/                 # ✅ Código fonte
│   ├── dist/                # ⚠️ Gerado após build
│   ├── .env                 # ✅ Variáveis de ambiente (criar)
│   ├── .env.example         # ✅ Template
│   ├── package.json         # ✅ Dependências
│   └── vite.config.js       # ✅ Config Vite
└── README.md
```

---

## ⚙️ Configuração do Arc Network

### **1. Adicionar Arc Testnet à MetaMask**

1. Abra MetaMask
2. Clique em "Add Network"
3. Preencha:
   - **Network Name**: Arc Network Testnet
   - **RPC URL**: https://rpc.arc.network
   - **Chain ID**: 111111
   - **Currency Symbol**: USDC
   - **Block Explorer**: https://explorer.arc.network

### **2. Obter USDC Testnet**

1. Acesse: https://faucet.arc.network
2. Cole seu endereço de wallet
3. Clique em "Claim 100 USDC"
4. Aguarde confirmação (~1 segundo)

---

## 🐛 Troubleshooting

### **Erro: "Cannot find module '@vitejs/plugin-react'"**
```bash
npm install @vitejs/plugin-react --save-dev
```

### **Erro: "Tailwind not working"**
```bash
npm install -D tailwindcss postcss autoprefixer
```

### **Erro: "Port 3000 already in use"**
```bash
# Mude a porta em vite.config.js
server: {
  port: 3001
}
```

### **Erro: "wagmi config not found"**
Verifique se o arquivo `src/config/wagmi.js` existe e está configurado corretamente.

---

## 📚 Próximos Passos

Após instalação bem-sucedida:

1. ✅ **Deploy Smart Contract** na Arc Testnet
2. ✅ **Configure .env** com contract address
3. ✅ **Teste wallet connection**
4. ✅ **Implemente funcionalidade de payment links**

---

## 💡 Dicas

- Use **VSCode** com extensões:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  
- Para development mais rápido:
  ```bash
  npm run dev -- --host
  ```
  Isso permite acesso via IP local (mobile testing)

---

## 🆘 Precisa de Ajuda?

- 📧 Email: contato@arcpay.app
- 💬 Discord: https://discord.gg/arc
- 🐦 Twitter: @arcpay

---

**Boa sorte! 🚀**

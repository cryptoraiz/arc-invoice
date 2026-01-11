# 🔗 Arc Invoice - Payment Links for USDC & EURC

> Professional payment links on the Arc Network. Create, share, receive.

[![Arc Network](https://img.shields.io/badge/Built%20on-Arc%20Network-blue)](https://arc.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Problem

Receiving crypto payments is complicated:
- ❌ Copying/pasting wallet addresses (prone to errors)
- ❌ The customer doesn't know how much to pay
- ❌ No payment context
- ❌ Terrible UX for non-crypto-natives

---

## 💡 Solution

Arc Invoice creates **professional payment links** that:
- ✅ Customer clicks and sees a beautiful page
- ✅ Amount, description, and QR Code visible
- ✅ Connect wallet and pay in 2 clicks
- ✅ **Receipts**: Auto-generated PDF receipts
- ✅ **Mobile**: Deep linking for seamless mobile wallet payments
- ✅ **Settlement**: You receive USDC/EURC in < 1 second

---

## ✨ Key Features

- **🧾 Instant PDF Receipts**: Download professional proofs of payment automatically.
- **🚰 Integrated Faucet**: Built-in access to Testnet tokens for easy testing.
- **📱 Mobile Optimized**: Full support for WalletConnect and native Deep Linking.
- **🔄 Real-Time Sync**: Instant status updates across all devices via WebSockets/Polling.
- **⚡ Serverless Backend**: Powered by Vercel Functions for high availability.

---

## 🚀 Tech Stack

### **Frontend:**
- React 18 + Vite
- Tailwind CSS (Premium UI)
- Wagmi + Viem + WalletConnect
- Headless UI
- Framer Motion

### **Backend:**
- Node.js (Vercel Serverless Functions)
- Vercel Postgres (Neon)
- Ethers.js v6

### **Blockchain:**
- Arc Network Testnet
- USDC/EURC (Circle)

---

## 📦 Installation (Local Dev)

### **1. Clone the repository:**
```bash
git clone https://github.com/cryptoraiz/arc-invoice.git
cd arc-invoice
```

### **2. Install dependencies:**
```bash
cd frontend && npm install
cd ../backend && npm install
```

### **3. Environment Variables:**
Create `.env` in `backend/` and `frontend/` based on `.env.example`.
You will need a Postgres connection string (local or Vercel).

### **4. Run locally:**
```bash
# Root directory
./start-dev.bat
```
(Starts Frontend + Backend concurrently)

Access: `http://localhost:5173`

---

## 🌐 Deploy

### **Full Stack (Vercel):**
This project is optimized for deployment on Vercel.

1. Import the repository to Vercel.
2. Configure the **Root Directory** as `frontend` (for UI) or set up a Monorepo structure.
3. Add `POSTGRES_URL` environment variables.
4. Deploy!

---

## 📝 Status

- [x] Deploy smart contract on Arc Testnet
- [x] Integrate Wagmi for wallet connection
- [x] Implement link generation functionality
- [x] **Vercel Serverless + Postgres Backend**
- [x] **PDF Receipt Generation**
- [x] **Mobile Optimization & Deep Linking**
- [x] Real-time notifications and Status Sync

---

## 🤝 Contributing

1. Fork the project
2. Create your branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add: New feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

MIT © 2026 Arc Invoice

---

## 🙏 Acknowledgments

- **Arc Network** - Payment Blockchain
- **Circle** - USDC/EURC stablecoins

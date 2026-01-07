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
- ✅ You receive USDC/EURC in < 1 second

---

## 🚀 Tech Stack

### **Frontend:**
- React 18
- Vite
- Tailwind CSS
- Wagmi + Viem (Web3)
- Headless UI (custom dropdown)
- Framer Motion (animations)
- React QR Code

### **Backend:**
- Node.js + Express
- PostgreSQL (Supabase/Neon) (Migrated from MongoDB)
- Ethers.js v6

### **Blockchain:**
- Arc Network Testnet
- USDC/EURC (Circle)
- Solidity 0.8.x

---

## 📦 Installation (Simple)

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

### **3. Configure the Database:**
Create a PostgreSQL database and get the connection string. Rename `.env.example` to `.env` in the backend folder and add your specific URL.

### **4. Run everything together:**
Just run the automatic script in the root:
```bash
./start-dev.bat
```
(This will start Frontend and Backend simultaneously in separate windows)

Access: `http://localhost:5173`

---

## 📁 Project Structure

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
- [x] Deploy smart contract on Arc Testnet
- [x] Integrate Wagmi for wallet connection
- [x] Implement link generation functionality
- [x] Create Node.js + MongoDB backend
- [x] Payment history
- [x] Real-time notifications

---

## 🤝 Contributing

1. Fork the project
2. Create your branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add: New feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

MIT © 2025 Arc Invoice

---

## 🙏 Acknowledgments

- **Arc Network** - Payment Blockchain
- **Circle** - USDC/EURC stablecoins

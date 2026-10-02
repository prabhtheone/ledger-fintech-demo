# Ledger — FinTech Platform Demo

> A polished, browser-only FinTech dashboard demo for exploring digital wallets, payments, budgeting, fraud detection, merchant operations, and admin workflows.

[![Live Demo](https://img.shields.io/badge/Live-Demo-0f172a?style=for-the-badge)](https://prabhtheone.github.io/ledger-fintech-demo/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](./LICENSE)
[![No Backend](https://img.shields.io/badge/Backend-None-38bdf8?style=for-the-badge)](#architecture)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)](#tech-stack)

## Why Ledger?

Ledger is a **FinTech UI/logic showcase** designed to demonstrate how a modern financial product can handle customer, merchant, and administrative workflows in one cohesive interface. It is intentionally backend-free, so anyone can clone it and explore the complete experience without configuring a database, API keys, or environment variables.

**Use it to:**
- explore a realistic wallet and payments UX
- study client-side transaction and budgeting logic
- demonstrate fraud/risk decision flows
- showcase React UI work in a portfolio
- prototype FinTech product ideas quickly

## ✨ Features

### Customer experience
- 🔐 **Onboarding & KYC** — OTP-style verification and simulated identity checks
- 💳 **Digital wallet** — balance management, mock bank linking, and top-ups
- 💸 **Payments & transfers** — P2P transfers, bill payments, and expense logging
- 🛡️ **Fraud Guard** — rule-based risk evaluation with step-up confirmation
- 📊 **Financial insights** — category breakdowns, trends, and financial health scoring
- 🎯 **Budgets & savings goals** — spending caps and progress tracking
- 🔔 **Smart notifications** — transaction, budget, and milestone alerts
- 💾 **Local persistence** — demo state survives browser refreshes via `localStorage`

### Operations
- 🏪 **Merchant dashboard** — sales monitoring, payment collection, and refunds
- 🛠️ **Admin dashboard** — account controls, flagged transaction review, and audit logs

## 🚀 Live demo

**[Open Ledger →](https://prabhtheone.github.io/ledger-fintech-demo/)**

The demo runs entirely in the browser. No account, API key, or backend is required.

## 🖥️ Run locally

Ledger is a zero-build static site. You only need a local HTTP server because browsers restrict ES module imports when `index.html` is opened directly with `file://`.

```bash
git clone https://github.com/prabhtheone/ledger-fintech-demo.git
cd ledger-fintech-demo
npx serve .
```

Or use Python:

```bash
python3 -m http.server 8000
```

Then open the localhost URL printed by the server.

## 🧱 Architecture

```text
index.html
   │
   ├── React / ReactDOM / Recharts / Lucide via ESM CDN
   │
   ▼
main.js
   │
   ▼
ledger-app.js  ← browser-ready runtime
   ▲
   │
ledger-app.jsx ← editable React source
   │
   ▼
localStorage ← demo-only persistence
```

There is **no server, database, authentication provider, payment gateway, or external financial API**. This makes the project easy to run and safe to use as a UI/logic demonstration, but it is not a production banking application.

## 🧪 What's functional vs simulated?

| Area | Demo behavior |
|---|---|
| UI & navigation | Functional | 
| Wallet balances | Functional client-side state | 
| Transactions | Functional client-side state | 
| Budgets & goals | Functional client-side calculations | 
| Fraud Guard | Functional rule-based demo engine | 
| Persistence | Browser `localStorage` | 
| OTP verification | Simulated | 
| KYC / AML | Simulated | 
| Bank connection | Simulated | 
| Money movement | Simulated — no real funds | 
| Authentication | Not implemented | 
| Backend/API | Not implemented | 

> **Security:** This repository does not require secrets or API keys. Never enter real financial credentials or personal banking information into the demo.

## 🛠️ Tech stack

- **React 18** — component-based UI
- **Tailwind CSS** — utility-first styling via CDN
- **Lucide React** — interface icons
- **Recharts** — financial charts
- **ES modules + esm.sh** — dependency loading without a bundler
- **localStorage** — client-side demo persistence

## 📁 Project structure

| File | Purpose |
|---|---|
| `index.html` | HTML shell, metadata, CDN/import-map configuration |
| `main.js` | Lightweight app bootstrap and error fallback |
| `ledger-app.jsx` | Editable React source |
| `ledger-app.js` | Browser-ready JavaScript shipped by the demo |
| `LICENSE` | MIT license |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CODE_OF_CONDUCT.md` | Community standards |

### Updating the browser build

If you edit `ledger-app.jsx`, regenerate `ledger-app.js` with:

```bash
npx esbuild ledger-app.jsx --format=esm --jsx=transform \
  --jsx-factory=React.createElement --jsx-fragment=React.Fragment \
  --outfile=ledger-app.js
```

## ♻️ Reset demo data

Open **Settings → Danger zone → Reset demo data** to clear the browser's stored demo state and restart the onboarding flow.

## 🤝 Contributing

Ideas, bug reports, UI improvements, accessibility fixes, and documentation improvements are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## 📌 Roadmap

- [ ] Add automated browser tests
- [ ] Improve accessibility and keyboard navigation
- [ ] Add a production-style build option
- [ ] Add richer transaction filtering and export
- [ ] Add optional mock API mode for full-stack demos
- [ ] Add screenshots and a short product walkthrough

## ⭐ Support the project

If Ledger is useful for learning, prototyping, or your portfolio, consider **starring the repository**. Stars help other developers discover the project.

## License

MIT — see [LICENSE](./LICENSE).

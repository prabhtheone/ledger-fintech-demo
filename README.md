# Ledger — FinTech Platform Demo

A fully interactive FinTech web app prototype built with React: onboarding & KYC, a digital wallet, P2P transfers, bill pay, expense tracking, budgets, savings goals, an AI-style fraud check, and separate Merchant and Admin dashboards — all running entirely in the browser with zero backend and zero build step.

## ✨ Features

## ✨ Key Features

* **🔐 Onboarding & KYC** — Interactive sign-up flow featuring OTP-style verification and simulated ID checks.
* **💳 Digital Wallet** — Real-time balance updates, mock bank account linking, and instant fund top-ups.
* **💸 Payments & Transfers** — Seamless P2P transfers, utility bill payments, and manual expense logging.
* **🛡️ AI Fraud Guard** — Automated risk engine that flags high-value transfers for step-up confirmation.
* **📊 Visual Insights** — Spend-by-category breakdowns, weekly trend charts, and a dynamic financial health score.
* **🎯 Budgets & Goals** — Category spending caps with visual progress bars and dedicated savings target buckets.
* **🔔 Smart Notifications** — In-app alert system for transaction events, budget thresholds, and goal milestones.
* **🏪 Merchant Suite** — Business portal to collect payments, process refunds, and monitor sales metrics.
* **🛠️ Admin Portal** — Governance suite to suspend/reinstate accounts, review flagged transactions, and inspect audit logs.
* **💾 Local Persistence** — Zero-backend state management using `localStorage` to retain data across sessions.

## 🚀 Live demo

Enable **GitHub Pages** for this repo (Settings → Pages → Source: `main` branch, `/ (root)`) and your live link will be:

```
https://<your-username>.github.io/<repo-name>/
```

## 🖥️ Run it locally

This is a zero-build static site — no `npm install` required. The only catch: it uses ES module `<script type="module">` imports, which most browsers **block when opened directly as a `file://` URL**. So don't just double-click `index.html` — serve it instead:

```bash
# Option 1 — Node (no install needed)
npx serve .

# Option 2 — Python
python3 -m http.server 8000

# Option 3 — VS Code
# Right-click index.html → "Open with Live Server"
```

Then open the printed `localhost` URL in your browser.

## 🧱 Tech stack

- **React 18** — via [esm.sh](https://esm.sh) CDN + an import map (no bundler)
- **Tailwind CSS** — Play CDN build, compiled in-browser
- **lucide-react** — icons
- **recharts** — the Insights charts
- **localStorage** — client-side persistence (per-browser, not shared between devices)

## 📁 Project structure

| File | Purpose |
|---|---|
| `index.html` | Entry HTML — Tailwind CDN, Google Fonts, and the import map for React / lucide-react / recharts |
| `main.js` | Mounts the app into `#root`, with a friendly fallback if a CDN module fails to load |
| `ledger-app.jsx` | App source (JSX) — edit this |
| `ledger-app.js` | Pre-transpiled, browser-ready build of `ledger-app.jsx` — what actually ships |
| `LICENSE` | MIT license |
| `.gitignore` | Standard ignores |

If you edit `ledger-app.jsx`, re-transpile it before your changes show up in the browser:

```bash
npx esbuild ledger-app.jsx --format=esm --jsx=transform \
  --jsx-factory=React.createElement --jsx-fragment=React.Fragment \
  --outfile=ledger-app.js
```

## ⚠️ What's Real vs. Simulated

| Feature Area | What's Real (Functional) | What's Simulated (Demo Only) |
| :--- | :--- | :--- |
| **State & Balances** | Live balance updates & real-time budget tracking | Stored locally via `localStorage` (no database) |
| **Logic & Rules** | Active fraud evaluation engine per transfer | Simulated money movement & dummy OTP verification |
| **Identity & Compliance** | Full onboarding UX flow | Mock KYC/AML verification without external APIs |
> **Security Note:** This project has no backend, database, or API keys. There are no sensitive credentials required to run or configure it.

## Reset demo data

Settings → Danger zone → **"Reset demo data"** clears local storage and restarts onboarding.

## License

MIT — see [LICENSE](./LICENSE).

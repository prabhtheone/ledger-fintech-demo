# Ledger — FinTech Platform Demo

A fully interactive FinTech web app prototype built with React: onboarding & KYC, a digital wallet, P2P transfers, bill pay, expense tracking, budgets, savings goals, an AI-style fraud check, and separate Merchant and Admin dashboards — all running entirely in the browser with zero backend and zero build step.

## ✨ Features

- **Onboarding & KYC** — sign-up flow with OTP-style verification and a simulated ID check
- **Wallet** — add money, see real-time balance, linked mock bank account
- **Payments** — P2P transfers, bill payments, manual expense logging
- **AI fraud check** — flags unusually large transfers and routes them through a confirmation step
- **Insights** — spend-by-category chart, weekly trend chart, a computed financial health score
- **Budgets & goals** — monthly category budgets with progress bars, savings goals you can contribute to
- **Notifications** — in-app alerts for transactions, budget thresholds, and goal milestones
- **Merchant view** — collect payments, issue refunds, track sales
- **Admin view** — suspend/reinstate the account, review AI-flagged transactions, audit trail
- **Persistence** — everything is saved to `localStorage`, so your data survives a refresh

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

## ⚠️ What's real vs. simulated

Every interaction is genuinely functional — balances actually change, budgets actually track spend, the fraud check actually evaluates each transfer.

What's **not** real: this isn't connected to any bank, UPI rail, or KYC/AML provider. Money movement, OTP, and identity verification are simulated for demo purposes. There is no backend, no database, and no API key anywhere in this project — nothing sensitive to configure, and nothing to leak.

## 🔭 Possible next steps

- Swap `localStorage` for a real backend (e.g. Supabase or Postgres + a small API) with row-level security, so each signed-in user gets a private, truly persistent account
- Real authentication (magic link / OAuth) in place of the simulated onboarding
- A real payments/KYC provider integration for a production version

## Reset demo data

Settings → Danger zone → **"Reset demo data"** clears local storage and restarts onboarding.

## License

MIT — see [LICENSE](./LICENSE).

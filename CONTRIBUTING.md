# Contributing to Ledger FinTech Demo

First off, thank you for taking the time to contribute! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. 

Any contributions you make to this FinTech demo are **greatly appreciated**.

---

## 📜 Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any inappropriate behavior to the project maintainers.

## 🐛 Reporting Bugs
If you find a bug in the wallet, payment flow, budgets, or dashboards, please open an **Issue** on GitHub and include:
* A clear and descriptive title.
* Steps to reproduce the bug.
* Expected behavior vs. actual behavior.
* Screenshots of the UI anomaly if applicable.

## 💡 Suggesting Enhancements
If you want to add new FinTech features (like new chart widgets, fraud check simulations, or currency toggles):
1. Check the existing issues to make sure it hasn't been suggested yet.
2. Open a new **Issue** describing your feature concept.
3. Explain how it improves the interactive web demo experience.

## 🚀 The Contribution Process

To contribute code updates, please follow this standard open-source workflow:

### 1. Fork the Repository
Click the **Fork** button at the top-right corner of this repository page (`prabhtheone/ledger-fintech-demo`) to create a copy under your account.

### 2. Clone Your Fork
Clone your forked repository to your local machine:
```bash
git clone https://github.com
cd ledger-fintech-demo
```

### 3. Create a Feature Branch
Never work directly on the `main` branch. Create a descriptive branch for your changes:
```bash
git checkout -b feature/amazing-new-dashboard
# Or for a fix:
git checkout -b fix/wallet-calculation
```

### 4. Make Changes and Test
* This project is built using **Pure React + Tailwind CSS** with a zero-backend architecture.
* Modify the layout or script architecture inside `index.html`, `main.js`, `ledger-app.js`, or `ledger-app.jsx`.
* Open `index.html` directly in your browser or use a simple local live-server extension to test your changes immediately (no complex build step required!).

### 5. Commit Your Changes
Write clear, concise commit messages using semantic prefixes:
```bash
git add .
git commit -m "feat: add payment success animation to wallet interface"
```

### 6. Push to Your Fork
Push your local branch up to your GitHub account:
```bash
git push origin feature/amazing-new-dashboard
```

### 7. Open a Pull Request (PR)
1. Navigate back to the original `prabhtheone/ledger-fintech-demo` repository.
2. Click the **"Compare & pull request"** banner.
3. Describe what your PR changes and link any related issues.
4. Submit the Pull Request!                                                                                                                                        
5. wait for approval..
---

## 🛠️ Project File Structure Guidelines
When editing code, keep these key codebase entry points in mind:
* `index.html`: The core structure and Tailwind CDN integration.
* `ledger-app.jsx` / `ledger-app.js`: Core interactive components for components like wallets, budgets, and fraud alerts.
* `main.js`: Main logic entry script.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

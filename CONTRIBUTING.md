# Contributing to Ledger FinTech Demo

🏁🎌

First off, thank you for taking the time to contribute! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. 

Any contributions you make to this FinTech demo are **greatly appreciated**.

---

## 📜 Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any inappropriate behavior to the project maintainers.

Reporting Bugs

Found a bug in the wallet, payment flows, budgets, or dashboards? Open an Issue on GitHub with:

Title: Concise and descriptive summary.

Reproduction Steps: Step-by-step actions to trigger the bug.

Behavior: What happened versus what you expected to happen.

Visuals: Screenshots or screen recordings showing the issue.

Suggesting Enhancements

Have an idea for a new FinTech feature like chart widgets, fraud simulations, or currency toggles?

Search: Check existing issues to prevent duplicates.

Submit: Open a new Issue detailing your feature concept.

Value: Briefly describe how it improves the demo experience.

The Contribution Process

Follow this standard workflow to submit code updates:

1. Fork the Repository
Click Fork at the top-right of prabhtheone/ledger-fintech-demo to duplicate the project to your GitHub account.

2. Clone Your Fork

Bash
git clone https://github.com/YOUR-USERNAME/ledger-fintech-demo.git
cd ledger-fintech-demo
3. Create a Feature Branch

Bash
git checkout -b feature/your-feature-name
# or for a bug fix:
git checkout -b fix/your-fix-name
4. Make Changes & Test

Built with React + Tailwind CSS (zero-backend architecture).

Make updates inside index.html, main.js, ledger-app.js, or ledger-app.jsx.

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

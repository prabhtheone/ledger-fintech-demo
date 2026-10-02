# Security Policy

## Scope

Ledger is a browser-only FinTech demonstration project. It is **not** a production banking, payments, KYC, AML, or financial-services system.

The demo may store sample application state in the browser's `localStorage`. Do not enter real passwords, payment credentials, bank details, identity documents, API keys, or other sensitive information.

## Reporting a vulnerability

If you discover a security issue in this repository, please do not disclose exploitable details in a public issue.

Instead, contact the repository maintainer privately through the contact options available on the maintainer's GitHub profile. Include:

- A short description of the issue
- The affected file or feature
- Reproduction steps or a minimal proof of concept
- The potential impact
- Any suggested remediation

Please allow reasonable time for investigation and remediation before publicly disclosing the issue.

## Security expectations for contributors

- Never commit secrets, API keys, tokens, private keys, credentials, or real financial/identity data.
- Use synthetic data in examples, tests, screenshots, and documentation.
- Do not treat client-side validation or demo fraud/KYC/OTP flows as real security controls.
- Review third-party CDN dependencies before introducing new ones.
- Keep dependency versions pinned where practical and update them deliberately.

## Supported versions

This project currently has one active development line: `main`.

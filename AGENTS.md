# Agent Guidelines & Context Engineering Principles

This repository contains the full-stack multi-tenant Hostel & Facility Management ERP platform with real-time biometric and financial ledger integration.

## Key Operating Directives
- **Prompt & Context Engineering**: Refer to [`PROMPT_AND_CONTEXT_ENGINEERING.md`](./PROMPT_AND_CONTEXT_ENGINEERING.md) for master system prompt architectures, few-shot templates, and JSON validation schemas.
- **Dynamic Bank & UPI QR Code Architecture**: Any bank account linked in the system dynamically receives a UPI ID (`hostel.{bankCode}@upi`), updates the unified treasury balances, and renders live in the UPI QR generator and Scanner / Fee Settlement modals.
- **3/4 Quorum Resident Consensus**: Room cleaning remarks require a 3/4 supermajority consensus to auto-resolve, otherwise escalating to the Warden.
- **Police Form-A & Section 188 IPC Compliance**: Verification forms must mask Aadhaar (`XXXX-XXXX-1234`) and PAN (`ABCXX1234F`), and apply digital signature integrity seals.
- **Dual Sign-Off & Four-Eyes Principle**: High-value transactions (>₹25,000) or high-cost repairs require 2FA TOTP verification and approval by two distinct authorized administrators.
- **Cross-Platform Sync**: Desktop `.exe` and Mobile `.apk` nodes communicate via SHA-256 sealed sync packets.

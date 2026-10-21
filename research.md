# Research: Invoice Liquidity Network (ILN)

Live project page / Hub submission reference: https://usestellarwavehub.vercel.app/projects/invoice-liquidity-network

## Project Name

Invoice Liquidity Network (ILN)

## Category

DeFi (Decentralized Invoice Factoring & Liquidity Coordination Primitives)

## Tags

defi, invoice-factoring, soroban, payments, smes, liquidity-pool, usdc, stellar-wave, escrow, smart-contracts, rust, typescript

## Links

- Main Organization & Docs Hub: https://github.com/Invoice-Liquidity-Network/Invoice-Liquidity-Network
- Smart Contract Repository (Wave-tracked): https://github.com/Invoice-Liquidity-Network/ILN-Smart-Contract
- Frontend dApp Repository (Wave-tracked): https://github.com/Invoice-Liquidity-Network/ILN-Frontend
- Documentation: https://docs.iln.finance
- Wave Program Registry: https://www.drips.network/wave/stellar/repos

## Verified Stellar/Soroban Identifier

**Contract ID (Stellar Testnet):**
`CCPASLHKRFBMVV5PZG3LKDGKFEDXZMB5U7DK42CVLUVWCMUCSRPVBIMO`

Verified via Stellar Expert Explorer:
https://stellar.expert/explorer/testnet/contract/CCPASLHKRFBMVV5PZG3LKDGKFEDXZMB5U7DK42CVLUVWCMUCSRPVBIMO

*Companion Protocol Deployments on Testnet:*
- **ILN-Distribution:** `CAQGPMT3EQK4AABMIR66JJXEOCNCLPTDNXMS5OHZXH4LI24UYAF25V5B`
- **ILN-Governance:** `CD7GOIU3GNK7EZHG7XWBC7VI4NRVGMRCU7X2FOCAPQN6EGTSW46BY4EB`

## Original Description

Invoice Liquidity Network (ILN) is an open-source, decentralized invoice factoring protocol and liquidity coordination engine built natively on the Stellar blockchain and powered by Soroban WebAssembly smart contracts. The protocol bridges the substantial working capital gap encountered by freelancers, independent digital creators, and small-to-medium enterprises (SMEs) across the globe. In conventional commercial operations, businesses regularly suffer from severe 30-, 60-, or 90-day accounts receivable payment delays, forcing them into reliance on predatory merchant cash advances, bureaucratic traditional banking credit assessments, or costly administrative underwriting. Invoice Liquidity Network completely disintermediates this traditional commercial factoring supply chain by turning verified, outstanding off-chain invoices into tokenized, programmatic on-chain receivables that can be settled and discounted trustlessly.

At its technical foundation, the Invoice Liquidity Network operates an atomic two-sided liquidity marketplace. Freelancers and enterprise billers submit digital receivables through the `submit_invoice()` interface, establishing key commercial terms: the principal face value, designated enterprise payer address, maturity timestamp (due date), accepted payment token (primarily Stellar-anchored stablecoins such as USDC and EURC), and a target discount rate offered to capital allocators. Rather than requiring bilateral negotiations or slow manual clearing, decentralized finance (DeFi) liquidity providers (LPs) browse the marketplace through automated indexer feeds and fund invoices directly via `fund_invoice()`. Upon funding, the smart contract calculates the net present value, disbursing instantaneous stablecoin capital directly to the freelancer while locking the underlying obligation into a Soroban-managed escrow position.

When the maturity date arrives and the client payer settles the invoice via `mark_paid()`, the protocol automatically directs the full face value back to the funding liquidity provider, unlocking the pre-agreed discount spread as annualized yield. By operating directly on Stellar's ultra-low-fee, deterministic consensus ledger and Soroban's `#![no_std]` Rust execution environment, ILN achieves instantaneous sub-5-second finality with negligible transaction costs. The protocol includes programmatic risk controls: dynamic collateral tiers, time-locked governance upgrade delays (`ADR-005`), decentralized oracle provider verification for debtor legitimacy, and non-custodial emergency recovery mechanics. Through this architecture, Invoice Liquidity Network establishes a transparent, borderless factoring rails system that transforms static corporate debt obligations into productive, liquid Web3 yield assets.

## Problem It Solves

Late payments and elongated accounts receivable cycles represent one of the leading causes of small enterprise insolvency worldwide:
- **The Working Capital Delay:** Freelancers and emerging service agencies deliver work immediately but routinely wait 60 to 90 days before receiving invoice settlements from corporate clients, causing acute cash flow deficits.
- **Exclusionary Traditional Factoring:** Traditional bank factoring services impose predatory fees (often 3% to 8% monthly discounting rates), demand extensive balance sheet audits, require personal guarantees, and generally reject invoices below six-figure enterprise thresholds.
- **Cross-Border FX and Settlement Friction:** International contractor payments lose significant value to correspondent banking wire charges, currency exchange markups, and multi-day clearing delays.
- **Counterparty Default & Lack of Transparency:** Centralized factoring brokers hold opaque books, leaving liquidity providers with limited insight into underlying borrower performance or dispute histories.

Invoice Liquidity Network resolves these systemic barriers by combining the global settlement velocity of Stellar with Soroban's deterministic smart contracts, democratizing commercial factoring into a permissionless, programmable DeFi primitive accessible to anyone with an internet connection and a Stellar wallet.

## How It Uses Stellar

- **Soroban Smart Contract Execution:** All factoring, escrow custody, fee calculation, and LP token accounting are implemented as native Soroban smart contracts, ensuring deterministic execution and safe storage TTL handling.
- **Stellar Asset Contract (SAC) Interoperability:** Uses the official SEP-41 token standard for seamless deposits and disbursements of native XLM and fiat-backed stablecoins (USDC and EURC).
- **Sub-Second Settlement & Ultra-Low Transaction Fees:** Stellar's low transaction fees allow micro-invoices (e.g., \$50–\$500) to be economically factored—a use case completely unviable on high-gas networks like Ethereum.
- **Freighter Wallet Integration:** Provides non-custodial authentication, allowing users to sign transactions directly in their browser without sharing private keys with third parties.

## Technical Approach

- **Smart Contract Architecture:** Written in `#![no_std]` Rust using the Soroban SDK. Includes `Invoice-Liquidity` for factoring escrow and state transitions, `ILN-Distribution` for fee routing, and `ILN-Governance` for 48-hour time-locked upgrade safety (`ADR-005`).
- **Next.js 14 Frontend:** Decoupled web client featuring a Freelancer dashboard, Liquidity Provider marketplace with yield calculations, and native Freighter/Stellar Wallets Kit integration.
- **Event-Driven Indexer:** Subscribes to Soroban RPC `getEvents` to track contract state transitions (`InvoicePaid`, `InvoiceFunded`, `InvoiceDefaulted`) and normalize them into a performant off-chain query layer.
- **Checks-Effects-Interactions Pattern:** All contract balance updates and state modifications occur before initiating external token transfer calls, neutralizing reentrancy attack vectors.

## Team and Community

Maintained by an open-source collective under the [Invoice-Liquidity-Network](https://github.com/Invoice-Liquidity-Network) GitHub organization. Active engineering contributors include `@codebuff-team`, `@therealjhay`, `@Halima-1`, `@JSE19`, `@dollfins`, `@Obiajulu-gif`, `@thegreatfeez`, `@Nursca`, and `@favouronyinye`, alongside a broader community of over 160 contributors participating in development, testing, and documentation across the codebase. Actively tracked and approved within the Stellar Wave Program repository registry on Drips Network, participating in regular contributor sprints and issue resolution rounds.

## Sources

1. https://www.drips.network/wave/stellar/repos (confirms approved Stellar Wave Program status)
2. https://github.com/Invoice-Liquidity-Network/Invoice-Liquidity-Network (org overview & docs)
3. https://github.com/Invoice-Liquidity-Network/ILN-Smart-Contract (Soroban smart contracts, state structures, and ADRs)
4. https://github.com/Invoice-Liquidity-Network/ILN-Frontend (Next.js dApp interface & wallet integration)
5. https://stellar.expert/explorer/testnet/contract/CCPASLHKRFBMVV5PZG3LKDGKFEDXZMB5U7DK42CVLUVWCMUCSRPVBIMO (on-chain testnet verification)
6. https://docs.iln.finance (protocol specification and factoring mechanics)

## Screenshots

### System Architecture Diagram
![ILN System Architecture](./research/iln-architecture.png)

### Factoring & Escrow Lifecycle
![ILN Factoring Flow](./research/iln-factoring-flow.png)

### On-Chain Contract Verification
![ILN On-Chain Verification](./research/iln-onchain-verification.png)

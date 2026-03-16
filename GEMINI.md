# Invest Calculator - Project Guide

This project is a specialized investment calculator built with **Next.js 15 (App Router)**, **React 19**, and **Tailwind CSS 4**. It helps users manage an "accumulation" investment strategy involving gold and stocks, featuring automated inter-fund borrowing and repayment logic.

## 🏗 Architecture Overview

- **Backend**: Supabase (Database & Auth bridge).
- **Authentication**: Clerk (Next.js integration).
- **State Management**: React Hooks (`useAccumulation`) with Supabase persistence.
- **Styling**: Tailwind CSS 4 with Radix UI primitives.

## 💡 Core Business Logic (`src/lib/accumulation-logic.ts`)

The heart of the application is the **Accumulation Engine**, which follows these rules:

1.  **Gold Unit**: The minimum purchase unit for gold is **0.5 chi** (`MIN_GOLD_UNIT`).
2.  **Inter-fund Borrowing**:
    - If the "Gold Fund" has enough cash for 0.5 chi, it buys it.
    - If it's short, it can **borrow** from the "Stock Fund" to reach the 0.5 chi threshold.
    - If it has leftover cash after buying (but not enough for another 0.5 chi), it **lends** the surplus to the "Stock Fund" (Debt: `stockOwesGold`).
3.  **Repayment Phase**:
    - Before buying, the engine checks for existing debts between funds.
    - If Gold owes Stock, it uses its monthly allocation to repay Stock first.
4.  **Proposal Pattern**: The `calculateInvestmentProposal` function is a pure function that generates a `Transaction` preview without modifying state.

## 🗄 Data Persistence

Data is stored in Supabase with **Row Level Security (RLS)** enabled, using Clerk JWTs for authorization.

-   **`investments`**: Stores the user's settings (e.g., `disableInterFundBorrowing`) and acts as a secondary/fallback store for running balances in a `state` JSONB blob.
-   **`investment_history`**: **The Primary Source of Truth.** It is a ledger of every confirmed transaction. The current running balances (`goldOwesStock`, `stockOwesGold`) are derived from the `_after` columns of the **most recent** history row.
-   **Consistency Requirement**: Any manual or automated update to borrowing balances MUST update both the `investments.state` blob and the latest `investment_history` row to ensure consistency across reloads.

## 🛠 Project Structure & Conventions

-   **`src/app/`**: Next.js App Router pages and API routes.
-   **`src/components/`**: Organized by feature (e.g., `investment/`, `calendar/`, `chart/`).
    -   `ui/`: Base Radix/Tailwind components.
-   **`src/hooks/`**: Custom hooks for data fetching and state management.
    -   `useAccumulation`: Primary hook for the calculator logic and persistence.
    -   `useSupabase`: Provides a Supabase client injected with the Clerk token.
-   **`src/lib/`**: Pure logic, utility functions, and API clients.
    -   `accumulation-logic.ts`: The core engine.
    -   `gold-price-client.ts`: Fetches real-time gold prices.
-   **`src/types/`**: TypeScript interfaces (strictly typed).

## 🔑 Key Coding Standards

-   **Type Safety**: Always use the types defined in `src/types/investment.ts` and `src/lib/accumulation-logic.ts`.
-   **Surgical Edits**: When modifying logic, ensure `calculateInvestmentProposal` remains pure and testable.
-   **UI Consistency**: Use Tailwind 4 utility classes. Prefer existing patterns in `src/components/ui/`.
-   **Persistence**: Any state change that should survive a refresh MUST be persisted via `persistSettings` or `persistHistoryRow` in the `useAccumulation` hook.

## 🚀 Development

-   **Gold Price**: The app fetches gold prices from a public API. Ensure the `proxy.ts` or `route.ts` handling this is maintained if the source changes.
-   **Auth**: Wrap protected components/routes with Clerk's `SignedIn` or `SignedOut`.

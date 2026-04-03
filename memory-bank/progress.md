# Project Progress

## Completed Features
- **Project Scaffolding**: Next.js App Router setup with TypeScript and Tailwind CSS.
- **UI System**: Integration of shadcn/ui components.
- **Database Layer**: Supabase client and hook integration.
- **Auth Layer**: Clerk authentication integration.
- **App Navigation**: Sidebar navigation now includes Calculator, Chart, Calendar, and Market routes.
- **Market Page**: Added a BTC market tracker with 24H/48H charting and external data fetching.
- **Core Components**:
    - Gold price card and API route.
    - Investment breakdown and history UI (with exact, non-rounded formatting).
    - Accumulation logic and plan simulation.
    - Lunar calendar export and visualization logic.
- **Proxy/API**: Proxy setup and gold price fetching routes.
- **Enhancements**: Quick 100% distribution shortcut buttons (Stocks, Bonds, Gold, Savings, Bitcoin) added to settings.

## Current Status
- The project has a solid foundation with most core modules implemented but requires further integration and refinement.
- Documentation and "Memory Bank" are being established for better AI collaboration.
- The `Market` page now contains an initial BTC short-term price chart backed by an API route.
- The Market chart build issue caused by a `recharts` tooltip formatter type mismatch has been resolved.
- Agent guidance now explicitly instructs direct commits to `main`.
- The accumulation engine and `useAccumulation` hook have been reviewed to capture the current transaction, borrowing, and persistence behavior.
- The accumulation engine no longer contains the stray `debugger;` statement.
- A permanent accumulation logic reference and flowchart now exists in `docs/accumulation-flow.md`.
- The accumulation engine now uses a 3-stage architecture: pre-calculation input assembly, pure calculation, and result formatting.
- Internal debt tracking has been simplified to a single signed debt value, while history persistence still writes compatibility directional columns.
- A Supabase SQL migration reference for `signed_debt_after` now exists in `docs/supabase-signed-debt-migration.sql`.
- The calculator now supports a local-only manual gold price fallback when live price loading fails, without persisting that manual input.

## Upcoming Tasks
- Expand the Market page with more assets, indicators, and richer analytics.
- Refine data persistence workflows between frontend and Supabase.
- Enhance gold price fetching reliability/frequency.
- Finalize the lunar calendar event management.
- Improve mobile responsiveness for the dashboard.

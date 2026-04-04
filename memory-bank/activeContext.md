# Active Context

## Current Focus
- Stabilizing the Market page after integrating BTC charting and recent upstream changes.
- Keeping agent workflow guidance aligned with the team's preference to commit directly to `main`.
- Refactoring the accumulation engine into pre-calc, pure calc, and result-formatting stages with a signed-debt model.

## Recent Changes
- Pulled the latest `main` updates before verification.
- Added a BTC market history API route backed by CoinGecko data.
- Added a Market page chart for BTC 24H and 48H price history.
- Updated the Market page header layout to stack on separate lines.
- Added agent guidance to prefer existing components, shadcn/ui, or third-party libraries before building custom components.
- Fixed the `recharts` tooltip formatter typing so TypeScript and production builds succeed.
- Added an `AGENTS.md` rule instructing agents to commit code directly to `main`.
- Reviewed the current accumulation engine and `useAccumulation` data flow to document how proposal generation, debt handling, and Supabase persistence work today.
- Removed a stray `debugger;` from the pure accumulation engine.
- Added a dedicated accumulation flow reference document at `docs/accumulation-flow.md`.
- Refactored the accumulation feature to use a single signed debt value internally while keeping compatibility writes for the old directional history columns.
- Split accumulation behavior into pre-calculation orchestration, pure calculation, and result formatting.
- Added a paste-ready SQL migration reference at `docs/supabase-signed-debt-migration.sql`.
- Added a local-only manual gold price fallback for the calculator when live gold price loading fails.
- The manual fallback appears in the accumulation plan area, can be reused during the current page session, and visibly marks proposals that used a manual price.
- Moved manual gold price control into the Gold Price card and made it always available, with manual value becoming the active calculation source until cleared.
- The Gold Price card now shows the active calculation price source (`Live` or `Manual`) and refreshes live data without disabling manual override.

## Next Steps
- Add more market instruments and metrics to the Market page.
- Consider caching and fallback handling for external market API failures.
- Apply the signed-debt SQL migration in Supabase if the team wants first-class DB support for the new model.

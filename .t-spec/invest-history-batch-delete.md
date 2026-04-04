# Plan: Invest History batch delete

## Goal
Add top-of-ledger row selection and batch delete in Invest History, and keep `investment_history` plus `investments.state` consistent after deletion.

## Background
`investment_history` is the primary ledger and the newest remaining row defines the current signed debt on reload. The user confirmed that batch deletion is only allowed for rows selected from the top of the history table, must use precise database row ids, must show a confirmation prompt, and must sync `investments.state` after deletion or reset to defaults if no history remains.

## Files
`src/lib/accumulation-logic.ts` — extend the `Transaction` type if needed so history rows can carry the database row id separately from the public transaction id.
`src/hooks/use-accumulation.ts` — map Supabase history rows with precise row ids, add batch-delete logic for top-selected rows, recompute local state from the newest remaining row, and persist the updated settings blob after deletion.
`src/components/investment/InvestmentHistory.tsx` — add selection UI, a select column, top-only selection constraints, and a batch delete button with disabled/loading states.
`src/app/page.tsx` — pass the new delete handler and any required state into `InvestmentHistory`.
`memory-bank/projectBrief.md` — update only if the feature meaningfully changes the documented user-facing capabilities.

## Steps
1. Update the history transaction shape so each rendered row includes the Supabase row `id` while preserving the existing transaction id and display fields.
2. Add a helper in `use-accumulation.ts` to derive the current accumulation state from a remaining history array, using the newest row’s `signedDebtAfter` and resetting to default balances when the array becomes empty.
3. Implement a `deleteHistoryRows` action in `use-accumulation.ts` that accepts ordered row ids, verifies they form a contiguous prefix of the current history list, confirms with the user, deletes those exact rows from `investment_history`, updates local `state.history`, and persists the resulting `investments.state`.
4. Keep the deletion logic precise and safe by rejecting non-top selections in the hook even if the UI already prevents them.
5. Update `InvestmentHistory.tsx` to manage row selection locally, render a select column and header control, and only allow selecting a contiguous block from the top of the table.
6. Add a delete button in the history card header that shows the selected count, is disabled when nothing valid is selected, and calls the new batch-delete action.
7. Wire the new props from `src/app/page.tsx` into `InvestmentHistory` without changing unrelated calculator behavior.
8. Run lint or targeted verification, then manually review the delete flow for these cases: delete one newest row, delete multiple newest rows, delete all rows, cancel confirmation, and attempt a non-top selection.

## Constraints
- Do not allow deleting arbitrary middle or older rows; only a contiguous selection from the top of the ledger is valid.
- Delete by database row `id`, not by `transaction_id`.
- After deletion, always sync `investments.state` to the newest remaining history row’s debt, or reset to default state when no history remains.
- Preserve existing history display styling and keep the new controls consistent with current shadcn/Tailwind patterns.
- Do not rewrite or recalculate historical `_after` values for retained rows in this change; the supported model is top-of-ledger deletion only.

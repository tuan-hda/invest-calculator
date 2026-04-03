# Plan: manual gold price fallback

## Goal
Allow the calculator to use a manually entered gold price when live price loading fails, without persisting that manual value to the database.

## Background
The calculator currently hard-fails proposal generation when `fetchGoldPrice()` returns an error, leaving the user with no way to continue. The fallback should be local-only, appear in the accumulation plan area, remain reusable during the current page session, and visibly indicate when a manual gold price is being used.

## Files
`src/hooks/use-accumulation.ts` — add local state for gold price fetch error, manual gold price value, and proposal source; allow proposal generation from manual price when live fetch fails.
`src/components/investment/AccumulationPlan.tsx` — add the manual gold price entry UI, retry/apply controls, and a visible note when a proposal uses a manual gold price.
`src/app/page.tsx` — pass the new manual-price props from the hook into the accumulation plan component.
`src/lib/accumulation-logic.ts` — extend the transaction/result shape if needed to mark whether the proposal used a manual gold price.
`memory-bank/activeContext.md` — update after implementation if the feature lands.
`memory-bank/progress.md` — update after implementation if the feature lands.

## Steps
1. Extend the hook state to track:
   - the latest gold price fetch error for calculator proposal generation
   - a local manual gold price value
   - whether the current proposal used a manual gold price
2. Refactor `calculateProposal` so it:
   - tries the live gold price first
   - if live fetch fails and a valid manual gold price exists, uses that manual price to continue calculation
   - if live fetch fails and no manual price exists, exposes the failure state to the UI instead of silently doing nothing
3. Add local-only manual gold price controls in the accumulation plan area that appear when calculator price loading fails:
   - numeric input for manual gold price
   - action to apply/retry calculation using the manual price
   - keep the manual value reusable for later recalculations in the same page session
4. Mark proposals calculated from a manual price and show a small note in the accumulation plan before save so the user can see that manual pricing was used.
5. Keep persistence unchanged:
   - do not save the manual input itself to `investments`
   - do not add any database fields for manual-price settings
   - continue saving the numeric `goldPrice` in confirmed history rows as usual
6. Verify the main flows:
   - live price fetch succeeds and manual UI stays out of the way
   - live price fetch fails and user can enter a manual price to get a proposal
   - repeated recalculations reuse the same local manual price during the current session
   - confirmed transactions still save normally

## Constraints
- The manual gold price must not be persisted to Supabase or any long-term storage.
- The fallback UI should live in the accumulation plan area, not the standalone gold price card.
- The feature should stay simple: only show the manual price UI when calculator price loading fails.
- A manual price should remain available locally during the current page session until changed or cleared.
- The accumulation plan should visibly indicate when a proposal used a manual gold price.
- Do not change the existing live price flow when the fetch succeeds.

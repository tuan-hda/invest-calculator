# Plan: move manual gold price to card

## Goal
Move manual gold price control into the Gold Price card and make it always available, with manual price becoming the active calculation source until the user explicitly clears it.

## Background
The current manual gold price fallback is buried inside the accumulation plan and only appears after a live fetch failure. The new design should make gold price source selection explicit and centralized in the Gold Price card, while keeping manual price local-only and reusable during the current page session.

## Files
`src/components/gold-price-card.tsx` — turn the card into the main gold-price control surface, showing live/manual state, manual input, clear override action, and refresh behavior.
`src/hooks/use-accumulation.ts` — move manual price source logic out of the error-only path and make it available as a normal active price source during calculation.
`src/app/page.tsx` — wire Gold Price card props from the hook and remove manual price controls from the accumulation plan area.
`src/components/investment/AccumulationPlan.tsx` — simplify back down so it shows plan state and whether manual price was used, but no longer owns the manual input.
`src/lib/accumulation-logic.ts` — keep the proposal result source marker so the UI can still indicate whether a proposal used live or manual pricing.
`memory-bank/activeContext.md` — update after implementation if the feature lands.
`memory-bank/progress.md` — update after implementation if the feature lands.

## Steps
1. Refactor the hook so manual gold price is treated as a normal local override source instead of an error-only fallback:
   - keep the manual value local-only
   - if a valid manual value exists, use it for proposal calculation immediately
   - still fetch live gold price for display and refresh behavior
2. Extend the hook API so the page can provide the Gold Price card with:
   - current live gold price data/error/loading state
   - current manual gold price value
   - whether manual override is active
   - actions to change manual value, clear it, and refresh live price
3. Move the manual input UI into the Gold Price card:
   - always show a manual-edit option
   - show the main displayed price as the active calculation price
   - clearly label whether the active source is `Live` or `Manual`
   - add an explicit action to clear manual override and return to live mode
4. Keep refresh behavior consistent:
   - refreshing should fetch the latest live price
   - if manual override is active, refresh updates live data in the background but does not automatically switch calculation back to live mode
5. Simplify the accumulation plan UI:
   - remove the manual input and apply button from the accumulation plan area
   - keep the small note when a proposal used a manual price
   - continue showing price-fetch errors when relevant, but not as the primary control point
6. Verify the main flows:
   - live fetch works and the Gold Price card shows live mode by default
   - entering a valid manual price immediately makes manual mode active for calculations
   - accumulation proposals use the manual price even when live price is available
   - clearing the manual override switches calculations back to live price
   - refreshing while manual override is active does not disable the override

## Constraints
- Manual gold price remains local-only and must not be persisted to Supabase or long-term storage.
- The Gold Price card becomes the single place to edit and manage manual gold price.
- A valid manual gold price should immediately take precedence over live price until explicitly cleared.
- The Gold Price card’s main displayed price should reflect the active calculation price, not just the fetched live feed.
- Refresh should update live price data without automatically turning off a manual override.
- The accumulation plan should no longer contain the manual price input controls.

# Plan: refactor accumulation engine

## Goal
Refactor the accumulation feature into three explicit stages, using a single signed debt value and a pure calculation engine that enforces the new repayment and cash invariants.

## Background
The current flow mixes data loading, borrowing decisions, calculation, and UI-facing formatting across `useAccumulation` and `accumulation-logic`. The new design must split pre-calculation input assembly, pure calculation, and result formatting, while making the user setting the only control for interchange-fund behavior. Debt should become a single signed value, partial repayment is allowed, and any period that repays an existing debt cannot borrow in the opposite direction during that same period.

## Files
`src/lib/accumulation-logic.ts` — refactor or replace with pure stage-2 calculation types and logic based on a single signed debt value.
`src/hooks/use-accumulation.ts` — move stage-1 pre-calculation assembly here or into a helper, call the new calculator, persist the new debt model, and keep confirmation/reset flows working.
`src/components/wallet-status.tsx` — update debt editing and display from two debt fields to one signed debt value plus derived direction labels.
`src/components/investment/InvestmentBreakdown.tsx` — consume stage-3 formatted result data instead of calculation-coupled mutated allocations.
`src/components/investment/AccumulationPlan.tsx` — consume stage-3 formatted action/result data from the new result formatter.
`src/app/page.tsx` — adjust prop wiring if the hook return shape changes.
`docs/accumulation-flow.md` — update the written flow so it matches the new 3-stage architecture and signed debt model.
`memory-bank/activeContext.md` — record the refactor once implementation begins or finishes.
`memory-bank/progress.md` — record the refactor once implementation begins or finishes.

## Steps
1. Define the new domain model for the calculator: create clear stage boundaries and types for pre-calculation input, raw calculation result, and display/formatted result, using one signed debt value where positive and negative encode debt direction and `0` means no debt.
2. Rewrite the pure calculation engine so it accepts only pre-calculated input data and returns only raw calculation facts, without UI text formatting or direct display allocation shaping.
3. Encode the new calculation rules exactly:
   - distribute the user-entered amount by category percentage first
   - enable interchange only from the user setting
   - interpret previous signed debt direction before the period starts
   - repay previous debt first using only the owing side’s available cash
   - allow partial repayment
   - if any repayment happened for an existing debt this period, do not allow that same side to borrow back during the same period
   - prioritize building gold after repayment
   - buy gold only in `0.5 chi` units
   - if gold is short and borrowing is allowed for this period, borrow from stock only when the rules permit
   - if gold has leftover post-buy cash, move it to stock and encode the resulting signed debt direction accordingly
4. Enforce invariants inside the engine and in tests/helpers used by the engine:
   - no cash bucket may become negative
   - final gold-side cash must end at `0`
   - gold purchases must always be in `0.5 chi` increments
   - the final signed debt must be internally consistent with the resulting transfers
5. Refactor `useAccumulation` into a clean stage-1 orchestration layer:
   - load `investments` and `investment_history`
   - fetch gold price
   - combine latest persisted debt, category distribution, user amount, and the user interchange setting into the new pre-calculation input
   - call the pure calculation stage
   - pass the raw result through the result-formatting stage
   - keep confirmation and reset behavior intact
6. Update persistence to store and reload the single signed debt value instead of two directional debt fields, while keeping history reconstruction based on the latest row consistent with the new model.
7. Add the stage-3 formatting layer that converts the raw calculation result into:
   - action/summary text
   - breakdown rows for display
   - wallet/debt display metadata
   Keep all user-facing string generation out of the pure calculator.
8. Update the calculator UI components to consume the new formatted result shape and signed-debt state, including the manual debt editor and any labels that currently assume two separate debt fields.
9. Update `docs/accumulation-flow.md` so it documents the new three-stage architecture, signed-debt interpretation, repayment rule, and final invariants.
10. Run focused verification for the refactor paths and check at minimum these scenarios:
   - no prior debt, enough gold allocation to buy directly
   - no prior debt, not enough gold allocation, borrowing allowed
   - prior gold-owes-stock debt with partial repayment
   - prior stock-owes-gold debt with partial repayment
   - interchange disabled by user
   - allocations with `0%` gold or `0%` stock while user setting remains the sole interchange control
   - leftover gold cash transferring to stock and ending with `goldCashAfter = 0`

## Constraints
- Do not keep the current auto-disable behavior based on `0%` gold or `0%` stock; the user setting is the only interchange toggle.
- Do not keep two directional debt values as the core model; use one signed debt value as the source of truth.
- Do not mix formatting concerns into the pure calculation stage.
- Do not allow any final negative cash values.
- Do not allow final gold-side cash to remain as arbitrary leftover money; it must resolve to `0`.
- Do not change the gold minimum unit from `0.5 chi`.
- Treat “partial repayment” as still being a repayment period, so that side cannot immediately borrow back in the same period.
- During a repayment period, leftover transfer from gold to stock may still create opposite-direction debt; only active borrow-to-buy is blocked.
- Preserve the existing user-facing flow of calculate preview, confirm, persist, and reload, unless a change is required by the new signed-debt model.

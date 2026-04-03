-- Add a signed debt column to investment_history.
-- Positive = Gold owes Stock
-- Negative = Stock owes Gold
-- Zero = no debt

alter table public.investment_history
add column if not exists signed_debt_after numeric not null default 0;

update public.investment_history
set signed_debt_after =
  case
    when coalesce(gold_owes_stock_after, 0) > 0 then coalesce(gold_owes_stock_after, 0)
    when coalesce(stock_owes_gold_after, 0) > 0 then -coalesce(stock_owes_gold_after, 0)
    else 0
  end
where signed_debt_after = 0;

comment on column public.investment_history.signed_debt_after is
'Signed inter-fund debt after each transaction. Positive = Gold owes Stock, negative = Stock owes Gold.';

create index if not exists investment_history_investment_id_created_at_idx
on public.investment_history (investment_id, created_at desc);

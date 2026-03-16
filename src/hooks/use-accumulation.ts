"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/use-supabase";
import { fetchGoldPrice } from "@/lib/gold-price-client";
import { DEFAULT_CATEGORIES } from "@/constants/investment";
import {
  type Transaction,
  type AccumulationState,
  DEFAULT_STATE,
  calculateInvestmentProposal,
  parseGoldPrice,
} from "@/lib/accumulation-logic";
import { Category } from "@/types/investment";

type InvestmentHistoryRow = {
  id: string;
  investment_id: string;
  transaction_id: string;
  created_at: string;
  action: string;
  gold_cost: number;
  gold_price: number;
  gold_bought: number;
  allocations: unknown;
  gold_cash_after: number;
  monthly_amount: number;
  stock_cash_after: number;
  gold_owes_stock_after: number;
  stock_owes_gold_after: number;
};

function rowToTransaction(row: InvestmentHistoryRow): Transaction {
  return {
    id: row.transaction_id,
    date: row.created_at,
    monthlyAmount: row.monthly_amount,
    goldPrice: row.gold_price,
    action: row.action,
    goldBought: row.gold_bought,
    goldCost: row.gold_cost,
    goldOwesStockAfter: row.gold_owes_stock_after,
    stockOwesGoldAfter: row.stock_owes_gold_after,
    goldCashAfter: row.gold_cash_after,
    stockCashAfter: row.stock_cash_after,
    allocations: (row.allocations as Transaction["allocations"]) ?? [],
  };
}

export function useAccumulation({ onConfirm }: { onConfirm?: () => void }) {
  const { user } = useUser();
  const { getSupabase } = useSupabase();
  const [state, setState] = useState<AccumulationState | null>(null);
  const [proposal, setProposal] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // investmentId is the PK of the investments row, needed for foreign key inserts
  const [investmentId, setInvestmentId] = useState<string | null>(null);

  // Load state from Supabase on mount
  useEffect(() => {
    async function loadState() {
      setLoading(true);
      try {
        const supabase = await getSupabase();

        // 1. Load the investments row (settings / running balances)
        const { data: inv, error: invErr } = await supabase
          .from("investments")
          .select("id, state, portfolio_config")
          .eq("user_id", user?.id)
          .single();

        if (invErr && invErr.code !== "PGRST116") {
          throw invErr;
        }

        if (!inv) {
          // No record yet – use defaults, history is empty
          setState(DEFAULT_STATE);
          setLoading(false);
          return;
        }

        setInvestmentId(inv.id);

        // 2. Load history rows ordered newest-first
        const { data: histRows, error: histErr } = await supabase
          .from("investment_history")
          .select("*")
          .eq("investment_id", inv.id)
          .order("created_at", { ascending: false });

        if (histErr) throw histErr;

        const history: Transaction[] = (histRows ?? []).map(
          (r: InvestmentHistoryRow) => rowToTransaction(r),
        );

        // Derive running balances from the most recent history item, falling
        // back to whatever is stored in the investments.state blob.
        const latest = history[0];
        const stored = (inv.state ?? {}) as Partial<AccumulationState>;

        setState({
          goldOwesStock:
            latest?.goldOwesStockAfter ?? stored.goldOwesStock ?? 0,
          stockOwesGold:
            latest?.stockOwesGoldAfter ?? stored.stockOwesGold ?? 0,
          goldCash: 0,
          stockCash: 0,
          disableInterFundBorrowing: stored.disableInterFundBorrowing ?? false,
          categories: inv.portfolio_config ?? DEFAULT_CATEGORIES,
          history,
        });
      } catch (e) {
        console.error("Failed to load state", e);
        setState(DEFAULT_STATE);
      } finally {
        setLoading(false);
      }
    }

    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Persist settings (balances + flags) to the investments row
  const persistSettings = useCallback(
    async (
      newState: AccumulationState,
      existingInvestmentId: string | null,
    ): Promise<string | null> => {
      if (!user) return existingInvestmentId;

      const settingsBlob = {
        goldOwesStock: newState.goldOwesStock,
        stockOwesGold: newState.stockOwesGold,
        goldCash: newState.goldCash,
        stockCash: newState.stockCash,
        disableInterFundBorrowing: newState.disableInterFundBorrowing,
        categories: newState.categories, // Kept for backward compatibility
      };

      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("investments")
          .upsert(
            {
              user_id: user.id,
              state: settingsBlob,
              portfolio_config: newState.categories,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .select("id")
          .single();

        if (error) throw error;
        return data?.id ?? existingInvestmentId;
      } catch (e) {
        console.error("Failed to persist settings to Supabase:", e);
        return existingInvestmentId;
      }
    },
    [user, getSupabase],
  );

  // Insert a single transaction into investment_history
  const persistHistoryRow = useCallback(
    async (tx: Transaction, invId: string) => {
      if (!user) return;
      try {
        const supabase = await getSupabase();
        const { error } = await supabase.from("investment_history").insert({
          investment_id: invId,
          user_id: user.id,
          transaction_id: tx.id,
          action: tx.action,
          gold_cost: tx.goldCost,
          gold_price: tx.goldPrice,
          gold_bought: tx.goldBought,
          allocations: tx.allocations,
          gold_cash_after: tx.goldCashAfter,
          monthly_amount: tx.monthlyAmount,
          stock_cash_after: tx.stockCashAfter,
          gold_owes_stock_after: tx.goldOwesStockAfter,
          stock_owes_gold_after: tx.stockOwesGoldAfter,
        });
        if (error) throw error;
      } catch (e) {
        console.error("Failed to persist history row to Supabase:", e);
      }
    },
    [user, getSupabase],
  );

  const calculateProposal = useCallback(
    async (amount: number, categories: Category[]) => {
      if (!amount || !state) return;
      setLoadingPrice(true);
      setProposal(null);

      try {
        const result = await fetchGoldPrice();
        if (!result.success) throw new Error(result.error);
        const goldData = result.data;

        const pricePerChi = parseGoldPrice(goldData.price);

        // Disable inter-fund borrowing if either gold or stock percentage is 0%
        const goldPercentage =
          categories.find((c) => c.id === "gold")?.percentage ?? 0;
        const stockPercentage =
          categories.find((c) => c.id === "stocks")?.percentage ?? 0;
        const shouldDisableInterFundBorrowing =
          goldPercentage === 0 || stockPercentage === 0;

        const stateForProposal = {
          ...state,
          disableInterFundBorrowing: shouldDisableInterFundBorrowing,
        };

        const proposalTrans = calculateInvestmentProposal(
          amount,
          categories,
          stateForProposal,
          pricePerChi,
        );

        setProposal(proposalTrans);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPrice(false);
      }
    },
    [state],
  );

  const confirmTransaction = useCallback(async () => {
    if (!proposal || !state || !user) return;

    const newState: AccumulationState = {
      goldOwesStock: proposal.goldOwesStockAfter,
      stockOwesGold: proposal.stockOwesGoldAfter,
      goldCash: proposal.goldCashAfter,
      stockCash: proposal.stockCashAfter,
      history: [proposal, ...state.history],
      disableInterFundBorrowing: state.disableInterFundBorrowing,
    };

    setState(newState);
    setProposal(null);
    onConfirm?.();

    // 1. Upsert investments row and get its id
    const invId = await persistSettings(newState, investmentId);
    if (invId && invId !== investmentId) setInvestmentId(invId);

    // 2. Insert the history row
    if (invId) await persistHistoryRow(proposal, invId);
  }, [
    proposal,
    state,
    user,
    onConfirm,
    investmentId,
    persistSettings,
    persistHistoryRow,
  ]);

  const resetState = useCallback(async () => {
    if (!user) return;
    if (confirm("Are you sure you want to clear all history?")) {
      setState(DEFAULT_STATE);
      setProposal(null);

      try {
        const supabase = await getSupabase();

        // Delete all history rows for this investment
        if (investmentId) {
          await supabase
            .from("investment_history")
            .delete()
            .eq("investment_id", investmentId);
        }

        // Reset the investments row
        await persistSettings(DEFAULT_STATE, investmentId);
      } catch (e) {
        console.error("Failed to reset state:", e);
      }
    }
  }, [user, investmentId, getSupabase, persistSettings]);

  const updateBorrowing = useCallback(
    async (goldOwesStock: number, stockOwesGold: number) => {
      if (!state || !user) return;

      const newState = { ...state, goldOwesStock, stockOwesGold };
      setState(newState);
      await persistSettings(newState, investmentId);

      // Also patch the most recent history row so the values are correct on next load
      if (investmentId) {
        try {
          const supabase = await getSupabase();

          // Find the id of the latest history row for this investment
          const { data: latest, error: fetchErr } = await supabase
            .from("investment_history")
            .select("id")
            .eq("investment_id", investmentId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (fetchErr && fetchErr.code !== "PGRST116") throw fetchErr;

          if (latest?.id) {
            const { error: updateErr } = await supabase
              .from("investment_history")
              .update({
                gold_owes_stock_after: goldOwesStock,
                stock_owes_gold_after: stockOwesGold,
              })
              .eq("id", latest.id);

            if (updateErr) throw updateErr;
          }
        } catch (e) {
          console.error("Failed to update latest history row borrowing:", e);
        }
      }
    },
    [state, user, investmentId, persistSettings, getSupabase],
  );

  const toggleDisableInterFundBorrowing = useCallback(async () => {
    if (!state || !user) return;

    const newState = {
      ...state,
      disableInterFundBorrowing: !state.disableInterFundBorrowing,
    };

    setState(newState);
    await persistSettings(newState, investmentId);
  }, [state, user, investmentId, persistSettings]);

  const updateCategories = useCallback(
    async (categories: Category[]) => {
      if (!state || !user) return;

      const newState = { ...state, categories };
      setState(newState);
      await persistSettings(newState, investmentId);
    },
    [state, user, investmentId, persistSettings],
  );

  return {
    state,
    proposal,
    categories: state?.categories ?? DEFAULT_CATEGORIES,
    loadingState: loading,
    loadingPrice,
    calculateProposal,
    confirmTransaction,
    resetState,
    updateBorrowing,
    updateCategories,
    toggleDisableInterFundBorrowing,
    clearProposal: () => setProposal(null),
  };
}

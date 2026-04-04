"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/use-supabase";
import {
  buildAccumulationStateFromHistory,
  useHistoryDeletion,
} from "@/hooks/use-history-deletion";
import { fetchGoldPrice, type GoldData } from "@/lib/gold-price-client";
import { DEFAULT_CATEGORIES } from "@/constants/investment";
import {
  type Transaction,
  type AccumulationState,
  type PreCalculationInput,
  DEFAULT_STATE,
  calculateAccumulation,
  formatCalculationResult,
  parseGoldPrice,
  toDirectionalDebt,
  toSignedDebt,
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
  signed_debt_after: number;
};

type StoredAccumulationState = Partial<AccumulationState> & {
  goldOwesStock?: number;
  stockOwesGold?: number;
};

function rowToTransaction(row: InvestmentHistoryRow): Transaction {
  const signedDebtAfter = row.signed_debt_after;

  return {
    id: row.transaction_id,
    historyRowId: row.id,
    date: row.created_at,
    monthlyAmount: row.monthly_amount,
    goldPrice: row.gold_price,
    goldPriceSource: "live",
    action: row.action,
    goldBought: row.gold_bought,
    goldCost: row.gold_cost,
    signedDebtAfter,
    debtDisplayAfter: {
      direction:
        signedDebtAfter > 0
          ? "gold_owes_stock"
          : signedDebtAfter < 0
            ? "stock_owes_gold"
            : "none",
      amount: Math.abs(signedDebtAfter),
      label:
        signedDebtAfter > 0
          ? "Gold owes Stock"
          : signedDebtAfter < 0
            ? "Stock owes Gold"
            : "No outstanding debt",
    },
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
  const [liveGoldPriceData, setLiveGoldPriceData] = useState<GoldData | null>(
    null,
  );
  const [loadingLiveGoldPrice, setLoadingLiveGoldPrice] = useState(false);
  const [liveGoldPriceError, setLiveGoldPriceError] = useState<string | null>(
    null,
  );
  const [goldPriceError, setGoldPriceError] = useState<string | null>(null);
  const [manualGoldPrice, setManualGoldPrice] = useState<string>("");
  const [investmentId, setInvestmentId] = useState<string | null>(null);

  const getManualGoldPriceValue = useCallback(() => {
    const normalizedManualGoldPrice = parseFloat(
      manualGoldPrice.replace(/,/g, "").trim(),
    );

    return Number.isFinite(normalizedManualGoldPrice) &&
      normalizedManualGoldPrice > 0
      ? normalizedManualGoldPrice
      : null;
  }, [manualGoldPrice]);

  const isManualGoldPriceActive = getManualGoldPriceValue() !== null;

  const refreshLiveGoldPrice = useCallback(
    async (forceRefresh = false) => {
      setLoadingLiveGoldPrice(true);
      setLiveGoldPriceError(null);

      try {
        const result = await fetchGoldPrice(forceRefresh);

        if (!result.success) {
          setLiveGoldPriceError(result.error);
          return null;
        }

        setLiveGoldPriceData(result.data);
        return result.data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load gold price";
        setLiveGoldPriceError(message);
        return null;
      } finally {
        setLoadingLiveGoldPrice(false);
      }
    },
    [],
  );

  useEffect(() => {
    refreshLiveGoldPrice();
  }, [refreshLiveGoldPrice]);

  useEffect(() => {
    async function loadState() {
      setLoading(true);
      try {
        const supabase = await getSupabase();
        const { data: inv, error: invErr } = await supabase
          .from("investments")
          .select("id, state, portfolio_config")
          .eq("user_id", user?.id)
          .single();

        if (invErr && invErr.code !== "PGRST116") {
          throw invErr;
        }

        if (!inv) {
          setState(DEFAULT_STATE);
          setLoading(false);
          return;
        }

        setInvestmentId(inv.id);

        const { data: histRows, error: histErr } = await supabase
          .from("investment_history")
          .select("*")
          .eq("investment_id", inv.id)
          .order("created_at", { ascending: false });

        if (histErr) throw histErr;

        const history: Transaction[] = (histRows ?? []).map(
          (row: InvestmentHistoryRow) => rowToTransaction(row),
        );

        const stored = (inv.state ?? {}) as StoredAccumulationState;
        const signedDebtFromStored =
          typeof stored.signedDebt === "number"
            ? stored.signedDebt
            : toSignedDebt(
                stored.goldOwesStock ?? 0,
                stored.stockOwesGold ?? 0,
              );
        setState({
          ...buildAccumulationStateFromHistory(history, {
            ...DEFAULT_STATE,
            disableInterFundBorrowing:
              stored.disableInterFundBorrowing ?? DEFAULT_STATE.disableInterFundBorrowing,
            categories: inv.portfolio_config ?? DEFAULT_CATEGORIES,
          }),
          signedDebt: history[0]?.signedDebtAfter ?? signedDebtFromStored ?? 0,
        });
      } catch (error) {
        console.error("Failed to load state", error);
        setState(DEFAULT_STATE);
      } finally {
        setLoading(false);
      }
    }

    loadState();
  }, [getSupabase, user?.id]);

  const persistSettings = useCallback(
    async (
      newState: AccumulationState,
      existingInvestmentId: string | null,
    ): Promise<string | null> => {
      if (!user) return existingInvestmentId;

      const { goldOwesStock, stockOwesGold } = toDirectionalDebt(
        newState.signedDebt,
      );

      const settingsBlob = {
        signedDebt: newState.signedDebt,
        goldOwesStock,
        stockOwesGold,
        goldCash: newState.goldCash,
        stockCash: newState.stockCash,
        disableInterFundBorrowing: newState.disableInterFundBorrowing,
        categories: newState.categories,
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
      } catch (error) {
        console.error("Failed to persist settings to Supabase:", error);
        return existingInvestmentId;
      }
    },
    [getSupabase, user],
  );

  const persistHistoryRow = useCallback(
    async (tx: Transaction, invId: string) => {
      if (!user) return;

      const { goldOwesStock, stockOwesGold } = toDirectionalDebt(
        tx.signedDebtAfter,
      );
      const basePayload = {
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
        gold_owes_stock_after: goldOwesStock,
        stock_owes_gold_after: stockOwesGold,
      };

      try {
        const supabase = await getSupabase();
        const { error } = await supabase.from("investment_history").insert({
          ...basePayload,
          signed_debt_after: tx.signedDebtAfter,
        });

        if (error) throw error;
      } catch (error) {
        console.error("Failed to persist history row to Supabase:", error);
      }
    },
    [getSupabase, user],
  );

  const calculateProposal = useCallback(
    async (amount: number, categories: Category[]) => {
      if (!amount || !state) return;

      setLoadingPrice(true);
      setProposal(null);
      setGoldPriceError(null);

      try {
        const buildProposal = (
          goldPrice: number,
          goldPriceSource: "live" | "manual",
        ) => {
          const input: PreCalculationInput = {
            amount,
            categories,
            goldPrice,
            signedDebt: state.signedDebt,
            interchangeEnabled: !state.disableInterFundBorrowing,
          };

          const rawResult = calculateAccumulation(input);
          const formattedResult = formatCalculationResult(rawResult, {
            goldPriceSource,
          });
          setProposal(formattedResult);
        };

        const manualOverridePrice = getManualGoldPriceValue();
        if (manualOverridePrice !== null) {
          buildProposal(manualOverridePrice, "manual");
          return;
        }

        const liveGoldData =
          liveGoldPriceData ?? (await refreshLiveGoldPrice(false));

        if (liveGoldData) {
          buildProposal(parseGoldPrice(liveGoldData.price), "live");
        } else {
          setGoldPriceError(
            liveGoldPriceError ?? "Failed to load gold price for calculation",
          );
        }
      } catch (error) {
        console.error(error);
        setGoldPriceError(
          error instanceof Error ? error.message : "Failed to load gold price",
        );
      } finally {
        setLoadingPrice(false);
      }
    },
    [
      getManualGoldPriceValue,
      liveGoldPriceData,
      liveGoldPriceError,
      refreshLiveGoldPrice,
      state,
    ],
  );

  const confirmTransaction = useCallback(async () => {
    if (!proposal || !state || !user) return;

    const newState: AccumulationState = {
      signedDebt: proposal.signedDebtAfter,
      goldCash: proposal.goldCashAfter,
      stockCash: proposal.stockCashAfter,
      history: [proposal, ...state.history],
      disableInterFundBorrowing: state.disableInterFundBorrowing,
      categories: state.categories,
    };

    setState(newState);
    setProposal(null);
    setGoldPriceError(null);
    onConfirm?.();

    const invId = await persistSettings(newState, investmentId);
    if (invId && invId !== investmentId) setInvestmentId(invId);

    if (invId) await persistHistoryRow(proposal, invId);
  }, [
    investmentId,
    onConfirm,
    persistHistoryRow,
    persistSettings,
    proposal,
    state,
    user,
  ]);

  const resetState = useCallback(async () => {
    if (!user) return;

    if (confirm("Are you sure you want to clear all history?")) {
      const resetStateValue = {
        ...DEFAULT_STATE,
        categories: state?.categories ?? DEFAULT_CATEGORIES,
      };

      setState(resetStateValue);
      setProposal(null);

      try {
        const supabase = await getSupabase();

        if (investmentId) {
          await supabase
            .from("investment_history")
            .delete()
            .eq("investment_id", investmentId);
        }

        await persistSettings(resetStateValue, investmentId);
      } catch (error) {
        console.error("Failed to reset state:", error);
      }
    }
  }, [getSupabase, investmentId, persistSettings, state?.categories, user]);

  const updateSignedDebt = useCallback(
    async (signedDebt: number) => {
      if (!state || !user) return;

      const newState = { ...state, signedDebt };
      setState(newState);
      await persistSettings(newState, investmentId);

      if (investmentId) {
        const { goldOwesStock, stockOwesGold } = toDirectionalDebt(signedDebt);
        const baseUpdate = {
          gold_owes_stock_after: goldOwesStock,
          stock_owes_gold_after: stockOwesGold,
        };

        try {
          const supabase = await getSupabase();
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
                ...baseUpdate,
                signed_debt_after: signedDebt,
              })
              .eq("id", latest.id);

            if (updateErr) throw updateErr;
          }
        } catch (error) {
          console.error("Failed to update latest history row borrowing:", error);
        }
      }
    },
    [getSupabase, investmentId, persistSettings, state, user],
  );

  const toggleDisableInterFundBorrowing = useCallback(async () => {
    if (!state || !user) return;

    const newState = {
      ...state,
      disableInterFundBorrowing: !state.disableInterFundBorrowing,
    };

    setState(newState);
    await persistSettings(newState, investmentId);
  }, [investmentId, persistSettings, state, user]);

  const updateCategories = useCallback(
    async (categories: Category[]) => {
      if (!state || !user) return;

      const newState = { ...state, categories };
      setState(newState);
      await persistSettings(newState, investmentId);
    },
    [investmentId, persistSettings, state, user],
  );

  const { deleteHistoryRows, deletingHistory } = useHistoryDeletion({
    getSupabase,
    investmentId,
    persistSettings,
    state,
    setState,
    userId: user?.id,
  });

  return {
    state,
    proposal,
    categories: state?.categories ?? DEFAULT_CATEGORIES,
    loadingState: loading,
    loadingPrice,
    goldPriceError,
    liveGoldPriceData,
    loadingLiveGoldPrice,
    liveGoldPriceError,
    manualGoldPrice,
    isManualGoldPriceActive,
    calculateProposal,
    confirmTransaction,
    resetState,
    updateSignedDebt,
    updateCategories,
    toggleDisableInterFundBorrowing,
    setManualGoldPrice,
    clearManualGoldPrice: () => setManualGoldPrice(""),
    refreshLiveGoldPrice,
    clearProposal: () => setProposal(null),
    deleteHistoryRows,
    deletingHistory,
  };
}

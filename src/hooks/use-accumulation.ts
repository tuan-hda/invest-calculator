"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/use-supabase";
import { fetchGoldPrice } from "@/lib/gold-price-client";
import {
  type Transaction,
  type AccumulationState,
  DEFAULT_STATE,
  calculateInvestmentProposal,
  parseGoldPrice,
} from "@/lib/accumulation-logic";

export function useAccumulation({ onConfirm }: { onConfirm?: () => void }) {
  const { user } = useUser();
  const { getSupabase } = useSupabase();
  const [state, setState] = useState<AccumulationState | null>(null);
  const [proposal, setProposal] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Load state from Supabase on mount/user change
  useEffect(() => {
    async function loadState() {
      setLoading(true);
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from("investments")
          .select("state")
          .eq("user_id", user?.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // No record found, use default
            setState(DEFAULT_STATE);
          } else {
            console.error("Error fetching state from Supabase:", error);
            setState(DEFAULT_STATE);
          }
        } else if (data?.state) {
          const parsed = data.state as AccumulationState;
          // Migration/Safety: Ensure history items have allocations
          if (parsed.history) {
            parsed.history = parsed.history.map((tx: Transaction) => ({
              ...tx,
              allocations: tx.allocations || [],
            }));
          }
          setState(parsed);
        }
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

  // Helper to persist state to Supabase
  const persistState = useCallback(
    async (newState: AccumulationState) => {
      if (!user) return;

      try {
        const supabase = await getSupabase();
        const { error } = await supabase.from("investments").upsert(
          {
            user_id: user.id,
            state: newState,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (error) throw error;
      } catch (e) {
        console.error("Failed to persist state to Supabase:", e);
      }
    },
    [user, getSupabase],
  );

  const calculateProposal = useCallback(
    async (
      amount: number,
      categories: { id: string; name: string; percentage: number }[],
    ) => {
      if (!amount || !state) return;
      setLoadingPrice(true);
      setProposal(null);

      try {
        const result = await fetchGoldPrice();
        if (!result.success) throw new Error(result.error);
        const goldData = result.data;

        const pricePerChi = parseGoldPrice(goldData.price);
        const proposalTrans = calculateInvestmentProposal(
          amount,
          categories,
          state,
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

    const newState = {
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

    // Persist to Supabase
    await persistState(newState);
  }, [proposal, state, user, onConfirm, persistState]);

  const resetState = useCallback(async () => {
    if (!user) return;
    if (confirm("Are you sure you want to clear all history?")) {
      setState(DEFAULT_STATE);
      setProposal(null);
      await persistState(DEFAULT_STATE);
    }
  }, [user, persistState]);

  const updateBorrowing = useCallback(
    async (goldOwesStock: number, stockOwesGold: number) => {
      if (!state || !user) return;

      const newState = {
        ...state,
        goldOwesStock,
        stockOwesGold,
      };

      setState(newState);
      await persistState(newState);
    },
    [state, user, persistState],
  );

  const toggleDisableInterFundBorrowing = useCallback(async () => {
    if (!state || !user) return;

    const newState = {
      ...state,
      disableInterFundBorrowing: !state.disableInterFundBorrowing,
    };

    setState(newState);
    await persistState(newState);
  }, [state, user, persistState]);

  return {
    state,
    proposal,
    loadingState: loading,
    loadingPrice,
    calculateProposal,
    confirmTransaction,
    resetState,
    updateBorrowing,
    toggleDisableInterFundBorrowing,
    clearProposal: () => setProposal(null),
  };
}

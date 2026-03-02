"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchGoldPrice } from "@/lib/gold-price-client";
import {
  type Transaction,
  type AccumulationState,
  DEFAULT_STATE,
  calculateInvestmentProposal,
  parseGoldPrice,
} from "@/lib/accumulation-logic";

export function useAccumulation({ onConfirm }: { onConfirm?: () => void }) {
  const [state, setState] = useState<AccumulationState | null>(null);
  const [proposal, setProposal] = useState<Transaction | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("invest_calc_accumulation");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure history items have allocations array if migrating from old version
        if (parsed.history) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parsed.history = parsed.history.map((tx: any) => ({
            ...tx,
            allocations: tx.allocations || [],
          }));
        }
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse saved state", e);
        setState(DEFAULT_STATE);
      }
    } else {
      setState(DEFAULT_STATE);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (state) {
      localStorage.setItem("invest_calc_accumulation", JSON.stringify(state));
    }
  }, [state]);

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

  const confirmTransaction = useCallback(() => {
    if (!proposal || !state) return;
    setState({
      goldOwesStock: proposal.goldOwesStockAfter,
      stockOwesGold: proposal.stockOwesGoldAfter,
      goldCash: proposal.goldCashAfter,
      stockCash: proposal.stockCashAfter,
      history: [proposal, ...state.history],
    });
    setProposal(null);
    onConfirm?.();
  }, [proposal, state, onConfirm]);

  const resetState = useCallback(() => {
    if (confirm("Are you sure you want to clear all history?")) {
      setState(DEFAULT_STATE);
      setProposal(null);
    }
  }, []);

  return {
    state,
    proposal,
    loadingPrice,
    calculateProposal,
    confirmTransaction,
    resetState,
    clearProposal: () => setProposal(null),
  };
}

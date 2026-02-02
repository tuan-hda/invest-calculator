"use client";

import { useState, useEffect, useCallback } from "react";
import { getGoldPrice } from "@/actions/gold-price";

export type CategoryAllocation = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
};

export type Transaction = {
  id: string;
  date: string;
  monthlyAmount: number;
  goldPrice: number;
  action: string;
  goldBought: number;
  goldCost: number;
  goldOwesStockAfter: number;
  stockOwesGoldAfter: number;
  goldCashAfter: number;
  stockCashAfter: number;
  allocations: CategoryAllocation[];
};

export type AccumulationState = {
  goldOwesStock: number;
  stockOwesGold: number;
  goldCash: number; // accumulated pending cash
  stockCash: number; // accumulated pending cash
  history: Transaction[];
};

const DEFAULT_STATE: AccumulationState = {
  goldOwesStock: 0,
  stockOwesGold: 0,
  goldCash: 0,
  stockCash: 0,
  history: [],
};

const MIN_GOLD_UNIT = 0.5; // chi

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

  const parseGoldPrice = (priceStr: string): number => {
    const raw = parseFloat(priceStr.replace(/,/g, ""));
    return raw; // "17,300" -> 17,300,000
  };

  const calculateProposal = useCallback(
    async (
      amount: number,
      categories: { id: string; name: string; percentage: number }[],
    ) => {
      if (!amount || !state) return;
      setLoadingPrice(true);
      setProposal(null);

      try {
        const result = await getGoldPrice();
        if (!result.success) throw new Error(result.error);
        const goldData = result.data;

        const pricePerChi = parseGoldPrice(goldData.price);
        const pricePerMinUnit = pricePerChi * MIN_GOLD_UNIT;

        // Start with current state
        let { goldCash, stockCash, goldOwesStock, stockOwesGold } = {
          ...DEFAULT_STATE, // ensure new fields exist if loading old state
          ...state,
        };

        // Calculate allocations
        const allocations: CategoryAllocation[] = categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          percentage: cat.percentage,
          amount: amount * (cat.percentage / 100),
        }));

        // Find specific allocations for logic
        const goldAlloc = allocations.find((c) => c.id === "gold")?.amount || 0;
        const stockAlloc =
          allocations.find((c) => c.id === "stocks")?.amount || 0;

        // Logic only updates if there is allocation for gold/bonds
        // But we still record the transaction even if 0, to track history?
        // Yes, track history for all input.

        goldCash += goldAlloc;
        stockCash += stockAlloc;

        let note = "";
        let goldBought = 0;
        let goldCost = 0;

        // Helper to update allocation amounts
        const adjustAllocation = (id: string, delta: number) => {
          const alloc = allocations.find((a) => a.id === id);
          if (alloc) {
            alloc.amount += delta;
          }
        };

        // 1. Repayment Phase (Prioritize Stock debt as it is the new mechanism)
        // Track if repayment happened to prevent borrowing in same direction this period
        let goldRepaidStocks = false;
        let stockRepaidGold = false;

        if (goldOwesStock > 0) {
          const maxRepay = goldCash;
          const repayAmount = Math.min(goldOwesStock, maxRepay);
          goldCash -= repayAmount;
          stockCash += repayAmount;
          goldOwesStock -= repayAmount;
          if (repayAmount > 0) {
            goldRepaidStocks = true;
            note += `Trả nợ Stock ${new Intl.NumberFormat("vi-VN").format(repayAmount)}đ. `;
            adjustAllocation("gold", -repayAmount);
            adjustAllocation("stocks", repayAmount);
          }
        } else if (stockOwesGold > 0) {
          const maxRepay = stockCash;
          const repayAmount = Math.min(stockOwesGold, maxRepay);
          stockCash -= repayAmount;
          goldCash += repayAmount;
          stockOwesGold -= repayAmount;
          if (repayAmount > 0) {
            stockRepaidGold = true;
            note += `Nhận nợ Stock ${new Intl.NumberFormat("vi-VN").format(repayAmount)}đ. `;
            adjustAllocation("stocks", -repayAmount);
            adjustAllocation("gold", repayAmount);
          }
        }

        // 2. Buy Phase
        if (goldCash >= pricePerMinUnit) {
          const units = Math.floor(goldCash / pricePerMinUnit);
          const buyAmount = units * MIN_GOLD_UNIT;
          const cost = units * pricePerMinUnit;

          goldCash -= cost;
          goldBought = buyAmount;
          goldCost = cost;
          note += `Mua ${buyAmount} chỉ. `;

          // Handle leftover: if there's remaining cash that's not enough for another unit,
          // transfer it to stocks (unless stock just repaid gold this period)
          if (goldCash > 0 && !stockRepaidGold) {
            const leftover = goldCash;
            goldCash -= leftover;
            stockCash += leftover;
            stockOwesGold += leftover;
            note += `Dồn ${new Intl.NumberFormat("vi-VN").format(leftover)}đ sang Stock. `;
            adjustAllocation("gold", -leftover);
            adjustAllocation("stocks", leftover);
          }
        } else {
          // Check if we can borrow from STOCKS
          // Rule: Can borrow if total (goldCash + stockCash) >= pricePerMinUnit
          // BUT cannot borrow if gold just repaid stocks this period
          const missing = pricePerMinUnit - goldCash;
          const maxBorrow = stockCash;

          if (missing > 0 && missing <= maxBorrow && !goldRepaidStocks) {
            stockCash -= missing;
            goldCash += missing;
            goldOwesStock += missing;
            note += `Vay Stock ${new Intl.NumberFormat("vi-VN").format(missing)}đ. `;
            adjustAllocation("stocks", -missing);
            adjustAllocation("gold", missing);

            goldBought = MIN_GOLD_UNIT;
            goldCost = pricePerMinUnit;
            goldCash -= goldCost;
            note += `Mua 0.5 chỉ. `;
          } else {
            // "Dồn sang Stock" logic:
            // Cannot transfer if stock just repaid gold this period
            if (goldCash > 0 && !stockRepaidGold) {
              const transfer = goldCash;
              goldCash -= transfer;
              stockCash += transfer;
              stockOwesGold += transfer;
              note += `Dồn ${new Intl.NumberFormat("vi-VN").format(transfer)}đ sang Stock. `;
              adjustAllocation("gold", -transfer);
              adjustAllocation("stocks", transfer);
            }
          }
        }

        const proposalTrans: Transaction = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString("vi-VN"),
          monthlyAmount: amount,
          goldPrice: pricePerChi,
          action: note,
          goldBought,
          goldCost,
          goldOwesStockAfter: goldOwesStock,
          stockOwesGoldAfter: stockOwesGold,
          goldCashAfter: goldCash,
          stockCashAfter: stockCash,
          allocations, // This now contains the adjusted values
        };

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

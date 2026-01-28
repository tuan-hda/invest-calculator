"use client";

import { useState, useEffect, useCallback } from "react";
import { getGoldPrice } from "@/actions/gold-price";

export type Transaction = {
  id: string;
  date: string;
  monthlyAmount: number;
  goldPrice: number;
  action: string;
  goldBought: number;
  goldCost: number;
  goldOwesBondAfter: number;
  bondOwesGoldAfter: number;
  goldCashAfter: number;
  bondCashAfter: number;
};

export type AccumulationState = {
  goldOwesBond: number;
  bondOwesGold: number;
  goldCash: number; // accumulated pending cash
  bondCash: number; // accumulated pending cash
  history: Transaction[];
};

const DEFAULT_STATE: AccumulationState = {
  goldOwesBond: 0,
  bondOwesGold: 0,
  goldCash: 0,
  bondCash: 0,
  history: [],
};

const GOLD_ALLOC_PERCENT = 0.2;
const BOND_ALLOC_PERCENT = 0.2;
const MIN_GOLD_UNIT = 0.5; // chi

export function useAccumulation() {
  const [state, setState] = useState<AccumulationState | null>(null);
  const [proposal, setProposal] = useState<Transaction | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("invest_calc_accumulation");
    if (saved) {
      try {
        setState(JSON.parse(saved));
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
    return raw * 1000; // "17,300" -> 17,300,000
  };

  const calculateProposal = useCallback(
    async (amount: number) => {
      if (!amount || !state) return;
      setLoadingPrice(true);
      setProposal(null);

      try {
        const goldData = await getGoldPrice();
        if (!goldData) throw new Error("Could not fetch gold price");

        const pricePerChi = parseGoldPrice(goldData.price);
        const pricePerMinUnit = pricePerChi * MIN_GOLD_UNIT;

        // Start with current state
        let { goldCash, bondCash, goldOwesBond, bondOwesGold } = state;

        // Add new allocation
        const goldAlloc = amount * GOLD_ALLOC_PERCENT;
        const bondAlloc = amount * BOND_ALLOC_PERCENT;

        goldCash += goldAlloc;
        bondCash += bondAlloc;

        let note = "";
        let goldBought = 0;
        let goldCost = 0;

        // 1. Repayment Phase
        if (goldOwesBond > 0) {
          const maxRepay = goldCash * 0.2;
          const repayAmount = Math.min(goldOwesBond, maxRepay);
          goldCash -= repayAmount;
          bondCash += repayAmount;
          goldOwesBond -= repayAmount;
          if (repayAmount > 0) {
            note += `Trả nợ ${new Intl.NumberFormat("vi-VN").format(repayAmount)}đ. `;
          }
        } else if (bondOwesGold > 0) {
          const maxRepay = bondCash * 0.2;
          const repayAmount = Math.min(bondOwesGold, maxRepay);
          bondCash -= repayAmount;
          goldCash += repayAmount;
          bondOwesGold -= repayAmount;
          if (repayAmount > 0) {
            note += `Nhận nợ ${new Intl.NumberFormat("vi-VN").format(repayAmount)}đ. `;
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
        } else {
          const missing = pricePerMinUnit - goldCash;
          const maxBorrow = bondCash * 0.2;

          if (missing <= maxBorrow) {
            bondCash -= missing;
            goldCash += missing;
            goldOwesBond += missing;
            note += `Vay ${new Intl.NumberFormat("vi-VN").format(missing)}đ. `;

            goldBought = MIN_GOLD_UNIT;
            goldCost = pricePerMinUnit;
            goldCash -= goldCost;
            note += `Mua 0.5 chỉ. `;
          } else {
            const transfer = goldCash * 0.2;
            goldCash -= transfer;
            bondCash += transfer;
            bondOwesGold += transfer;
            note += `Dồn ${new Intl.NumberFormat("vi-VN").format(transfer)}đ sang TP. `;
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
          goldOwesBondAfter: goldOwesBond,
          bondOwesGoldAfter: bondOwesGold,
          goldCashAfter: goldCash,
          bondCashAfter: bondCash,
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
      goldOwesBond: proposal.goldOwesBondAfter,
      bondOwesGold: proposal.bondOwesGoldAfter,
      goldCash: proposal.goldCashAfter,
      bondCash: proposal.bondCashAfter,
      history: [proposal, ...state.history],
    });
    setProposal(null);
  }, [proposal, state]);

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

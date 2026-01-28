"use client";

import { useState, useEffect, useCallback } from "react";
import { getGoldPrice } from "@/actions/gold-price";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  PiggyBank,
  Loader2,
  Trash2,
  CheckCircle2,
  History,
} from "lucide-react";

type Transaction = {
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

type AccumulationState = {
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

export function AccumulationManager() {
  const [monthlyAmount, setMonthlyAmount] = useState<number | "">("");
  const [state, setState] = useState<AccumulationState | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [proposal, setProposal] = useState<Transaction | null>(null);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setMonthlyAmount(value === "" ? "" : parseInt(value));
    setProposal(null); // Reset proposal on amount change
  };

  const parseGoldPrice = (priceStr: string): number => {
    const raw = parseFloat(priceStr.replace(/,/g, ""));
    return raw * 1000; // "17,300" -> 17,300,000
  };

  const calculateProposal = useCallback(async () => {
    if (!monthlyAmount || typeof monthlyAmount !== "number" || !state) return;
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
      const goldAlloc = monthlyAmount * GOLD_ALLOC_PERCENT;
      const bondAlloc = monthlyAmount * BOND_ALLOC_PERCENT;

      goldCash += goldAlloc;
      bondCash += bondAlloc;

      let note = "";
      let goldBought = 0;
      let goldCost = 0;

      // 1. Repayment Phase
      if (goldOwesBond > 0) {
        const maxRepay = goldCash * 0.2; // Limit repayment to 20% of available Gold Cash
        const amount = Math.min(goldOwesBond, maxRepay);
        goldCash -= amount;
        bondCash += amount;
        goldOwesBond -= amount;
        if (amount > 0) note += `Trả nợ ${formatCurrency(amount)}. `;
      } else if (bondOwesGold > 0) {
        const maxRepay = bondCash * 0.2; // Limit repayment to 20% of available Bond Cash
        const amount = Math.min(bondOwesGold, maxRepay);
        bondCash -= amount;
        goldCash += amount;
        bondOwesGold -= amount;
        if (amount > 0) note += `Nhận nợ ${formatCurrency(amount)}. `;
      }

      // 2. Buy Phase
      if (goldCash >= pricePerMinUnit) {
        // Can buy directly
        const units = Math.floor(goldCash / pricePerMinUnit);
        const buyAmount = units * MIN_GOLD_UNIT;
        const cost = units * pricePerMinUnit;

        goldCash -= cost;
        goldBought = buyAmount;
        goldCost = cost;
        note += `Mua ${buyAmount} chỉ. `;
      } else {
        // Not enough money, try to borrow
        const missing = pricePerMinUnit - goldCash;
        const maxBorrow = bondCash * 0.2; // Borrow max 20% from Bond Cash

        if (missing <= maxBorrow) {
          // Borrow logic
          bondCash -= missing;
          goldCash += missing;
          goldOwesBond += missing; // Debt increases
          note += `Vay ${formatCurrency(missing)}. `;

          // Buy min unit
          goldBought = MIN_GOLD_UNIT;
          goldCost = pricePerMinUnit;
          goldCash -= goldCost; // Should be 0
          note += `Mua 0.5 chỉ. `;
        } else {
          // Reverse: Transfer 20% of Gold Cash to Bond (accumulation logic)
          const transfer = goldCash * 0.2;
          goldCash -= transfer;
          bondCash += transfer;
          bondOwesGold += transfer; // Bond owes Gold
          note += `Dồn ${formatCurrency(transfer)} sang TP. `;
        }
      }

      const proposalTrans: Transaction = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString("vi-VN"),
        monthlyAmount: monthlyAmount,
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
  }, [monthlyAmount, state]);

  const confirmTransaction = () => {
    if (!proposal || !state) return;
    setState({
      goldOwesBond: proposal.goldOwesBondAfter,
      bondOwesGold: proposal.bondOwesGoldAfter,
      goldCash: proposal.goldCashAfter,
      bondCash: proposal.bondCashAfter,
      history: [proposal, ...state.history],
    });
    setProposal(null);
    setMonthlyAmount("");
  };

  const resetState = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      setState(DEFAULT_STATE);
      setProposal(null);
      setMonthlyAmount("");
    }
  };

  if (!state) return null;

  return (
    <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <CardHeader className="bg-gradient-to-r from-blue-300 to-cyan-300 dark:from-blue-900 dark:to-cyan-900 border-b-2 border-black dark:border-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-2">
            <PiggyBank className="h-6 w-6" />
            Accumulation Tracker
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetState}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50"
            title="Clear History"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-black dark:text-white font-bold opacity-80">
          Track usage of Gold & Bond funds (20% alloc each).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Status Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border-2 border-dashed border-black dark:border-white rounded bg-yellow-50 dark:bg-yellow-900/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-yellow-700 dark:text-yellow-400 mb-1">
              Gold Fund
            </h3>
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-500">Pending:</span>
              <span className="font-mono font-bold text-lg">
                {formatCurrency(state.goldCash)}
              </span>
            </div>
            {state.goldOwesBond > 0 && (
              <div className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                Owes Bond: {formatCurrency(state.goldOwesBond)}
              </div>
            )}
          </div>
          <div className="p-3 border-2 border-dashed border-black dark:border-white rounded bg-blue-50 dark:bg-blue-900/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
              Bond Fund
            </h3>
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-500">Pending:</span>
              <span className="font-mono font-bold text-lg">
                {formatCurrency(state.bondCash)}
              </span>
            </div>
            {state.bondOwesGold > 0 && (
              <div className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                Owes Gold: {formatCurrency(state.bondOwesGold)}
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 pt-4 border-t-2 border-black dark:border-white">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="monthly-amount"
              className="font-bold uppercase text-xs tracking-wider"
            >
              Investment Amount This Month (VND)
            </Label>
            <div className="flex gap-2">
              <Input
                id="monthly-amount"
                placeholder="e.g. 10,000,000"
                value={
                  monthlyAmount === ""
                    ? ""
                    : monthlyAmount.toLocaleString("vi-VN")
                }
                onChange={handleAmountChange}
                disabled={!!proposal}
                className="text-lg font-bold border-2 border-black dark:border-white flex-1"
              />
              {!proposal ? (
                <Button
                  onClick={calculateProposal}
                  disabled={!monthlyAmount || loadingPrice}
                  className="font-bold uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  {loadingPrice ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Calculate"
                  )}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setProposal(null)}
                  className="font-bold uppercase text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Proposal Preview */}
          {proposal && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 border-2 border-green-600 dark:border-green-400 rounded animate-in fade-in slide-in-from-top-2">
              <h4 className="font-black uppercase text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Proposed Action
              </h4>
              <div className="space-y-2 text-sm font-medium text-black dark:text-white">
                <p>
                  <span className="font-bold text-gray-500">Gold Price:</span>{" "}
                  {formatCurrency(proposal.goldPrice)} / chi
                </p>
                <p>
                  <span className="font-bold text-gray-500">Plan:</span>{" "}
                  {proposal.action}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                  <span className="text-gray-600 dark:text-gray-400">
                    New Gold Pend:
                  </span>
                  <span className="font-mono text-right">
                    {formatCurrency(proposal.goldCashAfter)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    New Bond Pend:
                  </span>
                  <span className="font-mono text-right">
                    {formatCurrency(proposal.bondCashAfter)}
                  </span>
                </div>
                <Button
                  onClick={confirmTransaction}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold uppercase border-2 border-transparent"
                >
                  Confirm & Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        {state.history.length > 0 && (
          <div className="space-y-2 pt-4 border-t-2 border-black dark:border-white">
            <h4 className="font-black uppercase text-sm tracking-widest flex items-center gap-2 text-gray-500">
              <History className="h-4 w-4" />
              History
            </h4>
            <div className="overflow-x-auto border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] rounded-sm max-h-[300px]">
              <Table>
                <TableHeader className="bg-black dark:bg-white sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-white dark:text-black font-bold uppercase text-xs w-[100px]">
                      Date
                    </TableHead>
                    <TableHead className="text-white dark:text-black font-bold uppercase text-xs text-right">
                      Input
                    </TableHead>
                    <TableHead className="text-white dark:text-black font-bold uppercase text-xs">
                      Action
                    </TableHead>
                    <TableHead className="text-white dark:text-black font-bold uppercase text-xs text-right">
                      Gold +
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.history.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="border-b border-black/10 dark:border-white/10 last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <TableCell className="font-bold text-xs py-2">
                        {tx.date}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right py-2">
                        {Math.round(tx.monthlyAmount / 1000000)}M
                      </TableCell>
                      <TableCell className="text-xs py-2 max-w-[150px] font-medium leading-tight">
                        {tx.action}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-right py-2 text-green-600 dark:text-green-400">
                        {tx.goldBought > 0 ? `${tx.goldBought}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

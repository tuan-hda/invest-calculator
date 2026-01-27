"use client";

import { useState, useCallback } from "react";
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
import { AlertCircle, Calculator, Loader2 } from "lucide-react";

type SimulationRow = {
  month: number;
  goldCashStart: number;
  bondCashStart: number;
  repayment: number; // positive = gold pays bond, negative = bond pays gold
  borrowed: number; // from bond to gold
  reverseTransfer: number; // from gold to bond
  goldBought: number; // units of 0.5 chi
  goldCost: number;
  goldCashEnd: number;
  bondCashEnd: number;
  goldOwesBond: number;
  bondOwesGold: number;
  action: string;
};

const GOLD_ALLOC_PERCENT = 0.2;
const BOND_ALLOC_PERCENT = 0.2;
const MIN_GOLD_UNIT = 0.5; // chi

export function AccumulationSimulator() {
  const [monthlyAmount, setMonthlyAmount] = useState<number | "">("");
  const [simulationData, setSimulationData] = useState<SimulationRow[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  };

  const parseGoldPrice = (priceStr: string): number => {
    // Expect "17,300" -> 17300 * 1000 = 17,300,000 VND / Chi
    // Remove comma
    const raw = parseFloat(priceStr.replace(/,/g, ""));
    // Unit is Nghìn VNĐ/Chỉ
    return raw * 1000;
  };

  const runSimulation = useCallback(async () => {
    if (!monthlyAmount || typeof monthlyAmount !== "number") return;
    setLoading(true);
    setError(null);
    setSimulationData(null);

    try {
      const goldData = await getGoldPrice();
      if (!goldData) throw new Error("Could not fetch gold price");

      const pricePerChi = parseGoldPrice(goldData.price);
      const pricePerMinUnit = pricePerChi * MIN_GOLD_UNIT; // 0.5 chi

      let goldCash = 0;
      let bondCash = 0;
      let goldOwesBond = 0;
      let bondOwesGold = 0;

      const rows: SimulationRow[] = [];

      for (let i = 1; i <= 12; i++) {
        const goldAlloc = monthlyAmount * GOLD_ALLOC_PERCENT;
        const bondAlloc = monthlyAmount * BOND_ALLOC_PERCENT;

        goldCash += goldAlloc;
        bondCash += bondAlloc;

        const startGold = goldCash;
        const startBond = bondCash;

        let repayment = 0;
        let note = "";

        // 1. Repayment Phase
        if (goldOwesBond > 0) {
          // Gold pays back Bond
          // "trích ra một khoản có thể, tối đa 20%" - assuming 20% of CURRENT gold cash available?
          // Or 20% of Allocation? Logic usually implies flux.
          // Let's take 20% of GoldCash as the max repayment limit.
          const maxRepay = goldCash * 0.2;
          const amount = Math.min(goldOwesBond, maxRepay);
          goldCash -= amount;
          bondCash += amount;
          goldOwesBond -= amount;
          repayment = amount; // Positive = Gold -> Bond
          note += `Trả nợ ${formatCurrency(amount)}. `;
        } else if (bondOwesGold > 0) {
          // Bond pays back Gold
          const maxRepay = bondCash * 0.2;
          const amount = Math.min(bondOwesGold, maxRepay);
          bondCash -= amount;
          goldCash += amount;
          bondOwesGold -= amount;
          repayment = -amount; // Negative = Bond -> Gold
          note += `Nhận nợ ${formatCurrency(amount)}. `;
        }

        // 2. Buy Phase
        let borrowed = 0;
        let reverseTransfer = 0;
        let goldBought = 0;
        let goldCost = 0;

        // Check if we can buy Gold
        if (goldCash >= pricePerMinUnit) {
          // Can buy directly
          // Buy as many 0.5 units as possible? Or just one?
          // "accumulation... buy gold". Usually you buy as much as you can.
          const units = Math.floor(goldCash / pricePerMinUnit);
          const buyAmount = units * MIN_GOLD_UNIT;
          const cost = units * pricePerMinUnit;

          goldCash -= cost;
          goldBought = buyAmount;
          goldCost = cost;
          note += `Mua ${buyAmount} chỉ. `;
        } else {
          // Not enough money
          const missing = pricePerMinUnit - goldCash;
          const maxBorrow = bondCash * 0.2;

          if (missing <= maxBorrow) {
            // Borrow from Bond
            borrowed = missing;
            bondCash -= borrowed;
            goldCash += borrowed;
            goldOwesBond += borrowed;
            note += `Vay ${formatCurrency(borrowed)}. `;

            // Buy 1 unit (min amount)
            goldBought = MIN_GOLD_UNIT;
            goldCost = pricePerMinUnit;
            goldCash -= goldCost; // Should be 0
            note += `Mua 0.5 chỉ. `;
          } else {
            // Reverse: Transfer to Bond
            // "ngay lập tức trích 20% vàng để mua trái phiếu"
            // Take 20% of GoldCash
            const transfer = goldCash * 0.2;
            reverseTransfer = transfer;
            goldCash -= transfer;
            bondCash += transfer;
            bondOwesGold += transfer;
            note += `Dồn ${formatCurrency(transfer)} sang TP. `;
          }
        }

        rows.push({
          month: i,
          goldCashStart: startGold,
          bondCashStart: startBond,
          repayment,
          borrowed,
          reverseTransfer,
          goldBought,
          goldCost,
          goldCashEnd: goldCash,
          bondCashEnd: bondCash,
          goldOwesBond,
          bondOwesGold,
          action: note,
        });
      }

      setSimulationData(rows);
    } catch (err: any) {
      setError(err.message || "Failed to simulate");
    } finally {
      setLoading(false);
    }
  }, [monthlyAmount]);

  return (
    <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <CardHeader className="bg-blue-300 dark:bg-blue-700 border-b-2 border-black dark:border-white">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Accumulation Simulation (12 Months)
        </CardTitle>
        <CardDescription className="text-black dark:text-white font-bold">
          Simulate Gold Buying with Debt/Accumulation Logic
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 w-full">
            <Label
              htmlFor="monthly-amount"
              className="font-bold uppercase text-xs tracking-wider"
            >
              Monthly Investment Amount (VND)
            </Label>
            <Input
              id="monthly-amount"
              placeholder="e.g. 10,000,000"
              value={
                monthlyAmount === ""
                  ? ""
                  : monthlyAmount.toLocaleString("vi-VN")
              }
              onChange={handleAmountChange}
              className="text-lg font-bold border-2 border-black dark:border-white"
            />
          </div>
          <Button
            onClick={runSimulation}
            disabled={!monthlyAmount || loading}
            className="w-full sm:w-auto font-bold uppercase border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            Run
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-white font-bold border-2 border-red-500 rounded flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {simulationData && (
          <div className="overflow-x-auto border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <Table>
              <TableHeader className="bg-black dark:bg-white text-white dark:text-black">
                <TableRow>
                  <TableHead className="text-white dark:text-black font-bold uppercase">
                    Month
                  </TableHead>
                  <TableHead className="text-white dark:text-black font-bold uppercase text-right">
                    Gold Cash
                  </TableHead>
                  <TableHead className="text-white dark:text-black font-bold uppercase text-right">
                    Bond Cash
                  </TableHead>
                  <TableHead className="text-white dark:text-black font-bold uppercase text-center">
                    Action
                  </TableHead>
                  <TableHead className="text-white dark:text-black font-bold uppercase text-right">
                    Gold Bought
                  </TableHead>
                  <TableHead className="text-white dark:text-black font-bold uppercase text-right">
                    End Gold
                  </TableHead>
                  <TableHead className="text-white dark:text-black font-bold uppercase text-right">
                    End Bond
                  </TableHead>
                  <TableHead className="text-white dark:text-black font-bold uppercase text-right">
                    Debt
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulationData.map((row) => (
                  <TableRow
                    key={row.month}
                    className="border-b-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <TableCell className="font-bold border-r border-black/20 dark:border-white/20">
                      {row.month}
                    </TableCell>
                    <TableCell className="text-right font-mono border-r border-black/20 dark:border-white/20">
                      {formatCurrency(row.goldCashStart)}
                    </TableCell>
                    <TableCell className="text-right font-mono border-r border-black/20 dark:border-white/20">
                      {formatCurrency(row.bondCashStart)}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs uppercase border-r border-black/20 dark:border-white/20 break-words max-w-[150px]">
                      {row.action}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600 dark:text-green-400 border-r border-black/20 dark:border-white/20">
                      {row.goldBought > 0 ? `${row.goldBought} chỉ` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono border-r border-black/20 dark:border-white/20">
                      {formatCurrency(row.goldCashEnd)}
                    </TableCell>
                    <TableCell className="text-right font-mono border-r border-black/20 dark:border-white/20">
                      {formatCurrency(row.bondCashEnd)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs">
                      {row.goldOwesBond > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          G debt: {formatCurrency(row.goldOwesBond)}
                        </span>
                      )}
                      {row.bondOwesGold > 0 && (
                        <span className="text-blue-600 dark:text-blue-400">
                          B debt: {formatCurrency(row.bondOwesGold)}
                        </span>
                      )}
                      {row.goldOwesBond === 0 && row.bondOwesGold === 0 && "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, RotateCcw, Save, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { GoldPriceCard } from "@/components/gold-price-card";
import { useAccumulation } from "@/hooks/use-accumulation";
import { WalletStatus } from "@/components/wallet-status";

type Category = {
  id: string;
  name: string;
  percentage: number;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "stocks", name: "Quỹ cổ phiếu", percentage: 20 },
  { id: "bonds", name: "Quỹ trái phiếu", percentage: 20 },
  { id: "gold", name: "Vàng", percentage: 35 },
  { id: "savings", name: "Tiết kiệm", percentage: 20 },
  { id: "bitcoin", name: "Bitcoin", percentage: 5 },
];

export default function InvestCalculator() {
  const [amount, setAmount] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const {
    state: accumulationState,
    proposal,
    loadingPrice,
    calculateProposal,
    confirmTransaction,
    resetState,
    clearProposal,
  } = useAccumulation({
    onConfirm: () => {
      setAmount("");
    },
  });

  // Debounced calculation for accumulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof amount === "number" && amount > 0) {
        calculateProposal(amount, categories);
      } else {
        clearProposal();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [amount, categories, calculateProposal]);

  const totalPercentage = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.percentage, 0);
  }, [categories]);

  const handlePercentageChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, percentage: numValue } : cat,
      ),
    );
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value === "" ? "" : parseInt(value));
  };

  const resetDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-yellow-300 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white uppercase mb-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] inline-block bg-black dark:bg-slate-900 text-white p-4 transform -rotate-2 border-2 border-white dark:border-white">
            Investment Calculator
          </h1>
          <div>
            <p className="text-black dark:text-white font-bold text-lg inline-block px-4 py-2 bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase tracking-tight">
              Plan your portfolio breakdown
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Configuration Section */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900">
              <CardHeader className="border-b-2 border-black dark:border-white pb-4">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Settings
                </CardTitle>
                <CardDescription className="text-black dark:text-slate-300 font-medium">
                  Enter your total capital and adjust distribution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="total-amount"
                    className="font-bold uppercase text-xs tracking-wider"
                  >
                    Total Investment Amount (VND)
                  </Label>
                  <Input
                    id="total-amount"
                    placeholder="e.g. 100,000,000"
                    value={amount === "" ? "" : amount.toLocaleString("vi-VN")}
                    onChange={handleAmountChange}
                    className="text-lg font-bold"
                  />
                </div>

                <Separator className="bg-black dark:bg-white h-[2px]" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold uppercase tracking-wider">
                      Distribution (%)
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetDefaults}
                      className="h-8 text-xs uppercase font-bold border-2 border-transparent hover:border-black dark:hover:border-white"
                    >
                      <RotateCcw className="mr-2 h-3 w-3" />
                      Reset
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-4"
                      >
                        <Label
                          htmlFor={category.id}
                          className="w-1/2 text-sm font-bold text-black dark:text-white truncate"
                        >
                          {category.name}
                        </Label>
                        <div className="relative w-1/2">
                          <Input
                            id={category.id}
                            type="number"
                            min="0"
                            max="100"
                            value={category.percentage}
                            onChange={(e) =>
                              handlePercentageChange(
                                category.id,
                                e.target.value,
                              )
                            }
                            className="pr-8 text-right font-bold"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-black dark:text-white">
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between p-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-sm font-bold",
                      totalPercentage === 100
                        ? "bg-green-300 dark:bg-green-700 text-black dark:text-white"
                        : "bg-yellow-300 dark:bg-yellow-700 text-black dark:text-white",
                    )}
                  >
                    <span className="uppercase tracking-wider">
                      Total Allocation:
                    </span>
                    <div className="flex items-center">
                      {totalPercentage !== 100 && (
                        <AlertCircle className="mr-2 h-4 w-4" />
                      )}
                      <span className="text-lg">{totalPercentage}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <WalletStatus state={accumulationState} onReset={resetState} />
            <GoldPriceCard />
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className=" flex flex-col bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <CardHeader className="border-b-2 border-black dark:border-white pb-4">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Breakdown
                </CardTitle>
                <CardDescription className="text-black dark:text-slate-300 font-medium">
                  Estimated value based on your settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-6 text-black dark:text-white">
                {amount === "" || amount === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-black/50 dark:text-white/50 min-h-[200px] font-bold uppercase tracking-wider text-center">
                    <p>
                      Enter an amount
                      <br />
                      to calculate
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-slate-900 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-black dark:bg-white">
                          <TableRow className="border-b-2 border-black dark:border-white hover:bg-black dark:hover:bg-white">
                            <TableHead className="text-white dark:text-black font-bold uppercase tracking-wider">
                              Category
                            </TableHead>
                            <TableHead className="text-right text-white dark:text-black font-bold uppercase tracking-wider">
                              Alloc
                            </TableHead>
                            <TableHead className="text-right text-white dark:text-black font-bold uppercase tracking-wider">
                              Amount (VND)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.map((category) => {
                            // If a proposal exists, use the calculated effective amount
                            // Otherwise, fallback to simple percentage calculation
                            let marketValue = 0;
                            if (proposal && proposal.allocations) {
                              const alloc = proposal.allocations.find(
                                (a) => a.id === category.id,
                              );
                              marketValue = alloc ? alloc.amount : 0;
                            } else {
                              marketValue =
                                (typeof amount === "number" ? amount : 0) *
                                (category.percentage / 100);
                            }
                            return (
                              <TableRow
                                key={category.id}
                                className="border-b-2 border-black dark:border-white hover:bg-yellow-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <TableCell className="font-bold text-black dark:text-white border-r-2 border-black dark:border-white">
                                  {category.name}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-black dark:text-white border-r-2 border-black dark:border-white">
                                  {category.percentage}%
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-black dark:text-white">
                                  {formatCurrency(marketValue)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-violet-200 dark:bg-violet-900 font-black border-t-2 border-black dark:border-white hover:bg-violet-300 dark:hover:bg-violet-800">
                            <TableCell className="uppercase border-r-2 border-black dark:border-white text-black dark:text-white">
                              Total
                            </TableCell>
                            <TableCell className="text-right border-r-2 border-black dark:border-white text-black dark:text-white">
                              {totalPercentage}%
                            </TableCell>
                            <TableCell className="text-right text-black dark:text-white">
                              {formatCurrency(
                                typeof amount === "number" ? amount : 0,
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Accumulation Action Proposal */}
                    <div className="p-4 border-2 border-black dark:border-white bg-green-50 dark:bg-green-900/20 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black uppercase text-sm mb-2 text-green-700 dark:text-green-400">
                            Accumulation Plan
                          </h4>
                          {loadingPrice ? (
                            <div className="text-sm font-bold text-gray-400 animate-pulse">
                              Calculating plan...
                            </div>
                          ) : proposal ? (
                            <div className="text-sm font-medium">
                              <p className="mb-1">{proposal.action}</p>
                              <div className="text-xs text-gray-500 font-bold">
                                Effect: Gold{" "}
                                {formatCurrency(proposal.goldCashAfter)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 font-bold">
                              Enter amount to see plan.
                            </div>
                          )}
                        </div>
                        <Button
                          disabled={!proposal}
                          onClick={confirmTransaction}
                          className="font-bold uppercase bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-2 border-transparent shadow-[2px_2px_0px_0px_rgba(100,100,100,0.5)] active:shadow-none active:translate-y-[2px] transition-all"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              {amount !== "" && amount > 0 && totalPercentage !== 100 && (
                <CardFooter className="bg-red-200 dark:bg-red-900 text-black dark:text-white text-sm font-bold p-4 border-t-2 border-black dark:border-white flex gap-2 items-center">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>Allocation is {totalPercentage}%. Should be 100%.</span>
                </CardFooter>
              )}
            </Card>

            {/* History Table */}
            {accumulationState && accumulationState.history.length > 0 && (
              <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <CardHeader className="py-3 border-b-2 border-black dark:border-white">
                  <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Invest History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader className="bg-gray-100 dark:bg-slate-800 sticky top-0">
                        <TableRow>
                          <TableHead className="font-bold uppercase text-xs w-[100px] pl-4">
                            Date
                          </TableHead>
                          <TableHead className="font-bold uppercase text-xs text-right">
                            Total Input
                          </TableHead>
                          <TableHead className="font-bold uppercase text-xs">
                            Breakdown
                          </TableHead>
                          <TableHead className="font-bold uppercase text-xs">
                            Action
                          </TableHead>
                          <TableHead className="font-bold uppercase text-xs text-right pr-4">
                            Gold+
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accumulationState.history.map((tx) => (
                          <TableRow
                            key={tx.id}
                            className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                          >
                            <TableCell className="font-bold text-xs pl-4 py-3 align-top">
                              {tx.date}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-right py-3 align-top">
                              {Math.round(tx.monthlyAmount / 1000000)}M
                            </TableCell>
                            <TableCell className="text-xs py-2 align-top">
                              <div className="space-y-1">
                                {tx.allocations?.map((alloc, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between gap-2 text-[10px]"
                                  >
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {alloc.name}
                                    </span>
                                    <span className="font-mono">
                                      {parseFloat(
                                        (alloc.amount / 1000000).toFixed(1),
                                      )}
                                      M
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium py-3 max-w-[150px] leading-tight whitespace-normal align-top">
                              {tx.action}
                            </TableCell>
                            <TableCell className="font-bold text-xs text-right pr-4 py-3 text-green-600 dark:text-green-400 align-top">
                              {tx.goldBought > 0 ? `${tx.goldBought}` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

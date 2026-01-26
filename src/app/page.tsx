"use client";

import { useState, useMemo } from "react";
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
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

type Category = {
  id: string;
  name: string;
  percentage: number;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "stocks", name: "Quỹ cổ phiếu", percentage: 35 },
  { id: "bonds", name: "Quỹ trái phiếu", percentage: 20 },
  { id: "gold", name: "Vàng", percentage: 20 },
  { id: "savings", name: "Tiết kiệm", percentage: 20 },
  { id: "bitcoin", name: "Bitcoin", percentage: 5 },
];

export default function InvestCalculator() {
  const [amount, setAmount] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

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
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-yellow-300 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black dark:text-white uppercase mb-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] inline-block bg-black dark:bg-slate-900 text-white p-4 transform -rotate-2 border-2 border-white dark:border-white">
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
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="h-full flex flex-col bg-white dark:bg-slate-900">
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
                          const marketValue =
                            (typeof amount === "number" ? amount : 0) *
                            (category.percentage / 100);
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
                )}
              </CardContent>
              {amount !== "" && amount > 0 && totalPercentage !== 100 && (
                <CardFooter className="bg-red-200 dark:bg-red-900 text-black dark:text-white text-sm font-bold p-4 border-t-2 border-black dark:border-white flex gap-2 items-center">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>Allocation is {totalPercentage}%. Should be 100%.</span>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

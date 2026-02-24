import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/investment";

interface InvestmentSettingsProps {
  amount: number | "";
  categories: Category[];
  totalPercentage: number;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPercentageChange: (id: string, value: string) => void;
  onReset: () => void;
}

export function InvestmentSettings({
  amount,
  categories,
  totalPercentage,
  onAmountChange,
  onPercentageChange,
  onReset,
}: InvestmentSettingsProps) {
  return (
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
            onChange={onAmountChange}
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
              onClick={onReset}
              className="h-8 text-xs uppercase font-bold border-2 border-transparent hover:border-black dark:hover:border-white"
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Reset
            </Button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-4">
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
                      onPercentageChange(category.id, e.target.value)
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
            <span className="uppercase tracking-wider">Total Allocation:</span>
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
  );
}

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
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/investment";

interface InvestmentSettingsProps {
  amount: number | "";
  categories: Category[];
  onPercentageChange: (id: string, value: string) => void;
  onReset: () => void;
}

export function InvestmentSettings({
  amount,
  categories,
  onPercentageChange,
  onReset,
}: InvestmentSettingsProps) {
  return (
    <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
      <CardHeader className="border-b-2 border-black dark:border-white pb-4">
        <CardTitle className="text-2xl font-black uppercase tracking-tight">
          Portfolio Mix
        </CardTitle>
        <CardDescription className="text-black dark:text-slate-300 font-medium">
          Enter amounts for each category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold uppercase tracking-wider">
              Category Amounts (VND)
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
                    type="text"
                    value={
                      category.amount === 0
                        ? ""
                        : category.amount.toLocaleString("vi-VN")
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      onPercentageChange(category.id, val);
                    }}
                    className="text-right font-bold pr-2"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "flex items-center justify-between p-4 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-lg font-black bg-black text-white dark:bg-white dark:text-black",
            )}
          >
            <span className="uppercase tracking-widest">Total Invested:</span>
            <span>{amount === "" ? 0 : amount.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { AccumulationState } from "@/hooks/use-accumulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type WalletStatusProps = {
  state: AccumulationState | null;
  onReset: () => void;
};

export function WalletStatus({ state, onReset }: WalletStatusProps) {
  if (!state) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <CardHeader className="bg-blue-300 dark:bg-blue-700 border-b-2 border-black dark:border-white py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5 text-black dark:text-white" />
            <CardTitle className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
              Accumulation Tracker
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
            title="Reset All"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Inter-Fund Borrowing
        </div>
        {state.goldOwesStock === 0 && state.stockOwesGold === 0 ? (
          <div className="p-4 border border-dashed border-black dark:border-white rounded bg-gray-50 dark:bg-gray-900/10 text-center">
            <div className="text-sm font-bold text-gray-400 dark:text-gray-500">
              No outstanding debts
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {state.goldOwesStock > 0 && (
              <div className="p-3 border-2 border-black dark:border-white rounded bg-yellow-300 dark:bg-red-900/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <div className="text-[10px] font-black uppercase text-black dark:text-red-400 mb-1">
                  Gold owes Stock
                </div>
                <div className="font-mono font-bold text-lg text-red-600 dark:text-red-400">
                  {formatCurrency(state.goldOwesStock)}
                </div>
              </div>
            )}
            {state.stockOwesGold > 0 && (
              <div className="p-3 border-2 border-black dark:border-white rounded bg-orange-50 dark:bg-orange-900/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <div className="text-[10px] font-black uppercase text-orange-700 dark:text-orange-400 mb-1">
                  Stock owes Gold
                </div>
                <div className="font-mono font-bold text-lg text-orange-600 dark:text-orange-400">
                  {formatCurrency(state.stockOwesGold)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

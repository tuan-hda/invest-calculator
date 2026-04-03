"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AccumulationState,
  formatSignedDebt,
} from "@/lib/accumulation-logic";

import { useState } from "react";

type WalletStatusProps = {
  state: AccumulationState | null;
  onUpdateSignedDebt: (signedDebt: number) => void;
  onToggleDisableInterFundBorrowing: () => void;
};

export function WalletStatus({
  state,
  onUpdateSignedDebt,
  onToggleDisableInterFundBorrowing,
}: WalletStatusProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editSignedDebt, setEditSignedDebt] = useState(0);

  if (!state) return null;

  const debtDisplay = formatSignedDebt(state.signedDebt);

  const handleSave = () => {
    onUpdateSignedDebt(editSignedDebt);
    setIsEditing(false);
  };

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
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Inter-Fund Borrowing Mode
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 border-2 border-black dark:border-white rounded bg-purple-50 dark:bg-purple-900/20">
            <button
              onClick={onToggleDisableInterFundBorrowing}
              className={`flex-1 p-2 font-bold uppercase text-xs rounded transition-all ${
                !state.disableInterFundBorrowing
                  ? "bg-green-400 dark:bg-green-700 text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              Enabled
            </button>
            <button
              onClick={onToggleDisableInterFundBorrowing}
              className={`flex-1 p-2 font-bold uppercase text-xs rounded transition-all ${
                state.disableInterFundBorrowing
                  ? "bg-orange-400 dark:bg-orange-700 text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              Disabled
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Inter-Fund Borrowing
          </div>
          {!isEditing && (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setEditSignedDebt(state.signedDebt);
                setIsEditing(true);
              }}
              className="h-auto p-0 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase"
            >
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4 p-3 border-2 border-dashed border-black dark:border-white rounded bg-gray-50 dark:bg-gray-900/10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500">
                Signed Debt (VND)
              </label>
              <input
                type="number"
                value={editSignedDebt}
                onChange={(e) => setEditSignedDebt(Number(e.target.value))}
                className="w-full p-2 border-2 border-black dark:border-white bg-white dark:bg-slate-800 font-mono font-bold text-sm"
              />
              <p className="text-[10px] font-bold text-gray-500">
                Positive = Gold owes Stock. Negative = Stock owes Gold.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-xs h-8"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 border-2 border-black dark:border-white font-bold uppercase text-xs h-8"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : debtDisplay.direction === "none" ? (
          <div className="p-4 border border-dashed border-black dark:border-white rounded bg-gray-50 dark:bg-gray-900/10 text-center">
            <div className="text-sm font-bold text-gray-400 dark:text-gray-500">
              No outstanding debts
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {debtDisplay.direction === "gold_owes_stock" && (
              <div className="p-3 border-2 border-black dark:border-white rounded bg-yellow-300 dark:bg-red-900/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <div className="text-[10px] font-black uppercase text-black dark:text-red-400 mb-1">
                  Gold owes Stock
                </div>
                <div className="font-mono font-bold text-lg text-red-600 dark:text-red-400">
                  {formatCurrency(debtDisplay.amount)}
                </div>
              </div>
            )}
            {debtDisplay.direction === "stock_owes_gold" && (
              <div className="p-3 border-2 border-black dark:border-white rounded bg-orange-50 dark:bg-orange-900/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <div className="text-[10px] font-black uppercase text-orange-700 dark:text-orange-400 mb-1">
                  Stock owes Gold
                </div>
                <div className="font-mono font-bold text-lg text-orange-600 dark:text-orange-400">
                  {formatCurrency(debtDisplay.amount)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

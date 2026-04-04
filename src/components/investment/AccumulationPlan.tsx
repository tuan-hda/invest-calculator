import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@/lib/accumulation-logic";

interface AccumulationPlanProps {
  loadingPrice: boolean;
  proposal: Transaction | null;
  goldPriceError: string | null;
  onConfirm: () => void;
}

export function AccumulationPlan({
  loadingPrice,
  proposal,
  goldPriceError,
  onConfirm,
}: AccumulationPlanProps) {
  return (
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
                Effect: Gold {formatCurrency(proposal.goldCashAfter)} | Debt{" "}
                {proposal.debtDisplayAfter.label}{" "}
                {formatCurrency(proposal.debtDisplayAfter.amount)}
              </div>
              {proposal.goldPriceSource === "manual" && (
                <div className="mt-2 inline-block rounded border-2 border-black bg-yellow-200 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-black">
                  Manual gold price used
                </div>
              )}
            </div>
          ) : goldPriceError ? (
            <div className="space-y-2">
              <div className="text-sm font-bold text-red-600">
                {goldPriceError}
              </div>
              <div className="text-xs font-bold text-gray-500">
                Update the Gold Price card to continue calculation.
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
          onClick={onConfirm}
          className="font-bold uppercase bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-2 border-transparent shadow-[2px_2px_0px_0px_rgba(100,100,100,0.5)] active:shadow-none active:translate-y-[2px] transition-all"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}

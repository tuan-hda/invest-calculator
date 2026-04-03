"use client";

import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import { GoldPriceCard } from "@/components/gold-price-card";
import { useAccumulation } from "@/hooks/use-accumulation";
import { WalletStatus } from "@/components/wallet-status";
import { Category } from "@/types/investment";
import { DEFAULT_CATEGORIES } from "@/constants/investment";
import { InvestmentSettings } from "@/components/investment/InvestmentSettings";
import { InvestmentBreakdown } from "@/components/investment/InvestmentBreakdown";
import { AccumulationPlan } from "@/components/investment/AccumulationPlan";
import { InvestmentHistory } from "@/components/investment/InvestmentHistory";
import { LoadingOverlay } from "@/components/loading-overlay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function InvestCalculator() {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [amount, setAmount] = useState<number | "">("");
  const [pendingCategories, setPendingCategories] = useState<Category[] | null>(
    null,
  );

  const {
    state: accumulationState,
    proposal,
    categories,
    loadingState,
    loadingPrice,
    goldPriceError,
    manualGoldPrice,
    calculateProposal,
    confirmTransaction,
    updateSignedDebt,
    updateCategories,
    toggleDisableInterFundBorrowing,
    setManualGoldPrice,
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
  }, [amount, categories, calculateProposal, clearProposal]);

  const totalPercentage = useMemo(() => {
    const source = pendingCategories ?? categories;
    return source.reduce((sum, cat) => sum + cat.percentage, 0);
  }, [pendingCategories, categories]);

  const handlePercentageChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const base = pendingCategories ?? categories;
    const newCategories = base.map((cat) =>
      cat.id === id ? { ...cat, percentage: numValue } : cat,
    );
    setPendingCategories(newCategories);
  };

  const handleConfirmCategories = () => {
    if (pendingCategories) {
      updateCategories(pendingCategories);
      setPendingCategories(null);
    }
  };

  const handleQuickSelect = (categoryId: string) => {
    const base = categories;
    const newCategories = base.map((cat) =>
      cat.id === categoryId
        ? { ...cat, percentage: 100 }
        : { ...cat, percentage: 0 },
    );
    updateCategories(newCategories);
    setPendingCategories(null);
  };

  const handleCancelCategories = () => {
    setPendingCategories(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value === "" ? "" : parseInt(value));
  };

  const resetDefaults = () => {
    setPendingCategories(DEFAULT_CATEGORIES);
  };

  if (!isUserLoaded) {
    return <LoadingOverlay />;
  }

  if (!isSignedIn) {
    return null;
  }

  if (loadingState) {
    return <LoadingOverlay />;
  }

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
            <InvestmentSettings
              amount={amount}
              categories={pendingCategories ?? categories}
              committedCategories={categories}
              totalPercentage={totalPercentage}
              onAmountChange={handleAmountChange}
              onPercentageChange={handlePercentageChange}
              onReset={resetDefaults}
              onConfirmCategories={handleConfirmCategories}
              onCancelCategories={handleCancelCategories}
              onQuickSelect={handleQuickSelect}
              hasPendingChanges={pendingCategories !== null}
            />
            <WalletStatus
              state={accumulationState}
              onUpdateSignedDebt={updateSignedDebt}
              onToggleDisableInterFundBorrowing={
                toggleDisableInterFundBorrowing
              }
            />
            <GoldPriceCard />
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="flex flex-col bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
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
                    <InvestmentBreakdown
                      amount={amount}
                      categories={categories}
                      proposal={proposal}
                      totalPercentage={totalPercentage}
                    />
                    <AccumulationPlan
                      loadingPrice={loadingPrice}
                      proposal={proposal}
                      goldPriceError={goldPriceError}
                      manualGoldPrice={manualGoldPrice}
                      onManualGoldPriceChange={setManualGoldPrice}
                      onApplyManualGoldPrice={() => {
                        if (typeof amount === "number" && amount > 0) {
                          calculateProposal(amount, categories);
                        }
                      }}
                      onConfirm={confirmTransaction}
                    />
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
              <InvestmentHistory history={accumulationState.history} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

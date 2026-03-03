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
} from "@/components/ui/card";

export default function InvestCalculator() {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const {
    state: accumulationState,
    proposal,
    loadingState,
    loadingPrice,
    calculateProposal,
    confirmTransaction,
    resetState,
    updateBorrowing,
    clearProposal,
  } = useAccumulation({});

  // Calculate total amount from categories
  const totalAmount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.amount, 0);
  }, [categories]);

  // Update percentages based on total amount for the logic to work
  const categoriesWithPercentages = useMemo(() => {
    if (totalAmount === 0) {
      return categories.map((cat) => ({ ...cat, percentage: 0 }));
    }
    return categories.map((cat) => ({
      ...cat,
      percentage: (cat.amount / totalAmount) * 100,
    }));
  }, [categories, totalAmount]);

  // Debounced calculation for accumulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (totalAmount > 0) {
        calculateProposal(totalAmount, categoriesWithPercentages);
      } else {
        clearProposal();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [
    totalAmount,
    categoriesWithPercentages,
    calculateProposal,
    clearProposal,
  ]);

  const handleCategoryAmountChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? { ...cat, amount: isNaN(numValue) ? 0 : numValue }
          : cat,
      ),
    );
  };

  const resetDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
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
              amount={totalAmount}
              categories={categories}
              onPercentageChange={handleCategoryAmountChange}
              onReset={resetDefaults}
            />
            <WalletStatus
              state={accumulationState}
              onReset={resetState}
              onUpdateBorrowing={updateBorrowing}
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
                {totalAmount === 0 ? (
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
                      amount={totalAmount}
                      categories={categoriesWithPercentages}
                      proposal={proposal}
                      totalPercentage={100}
                    />
                    <AccumulationPlan
                      loadingPrice={loadingPrice}
                      proposal={proposal}
                      onConfirm={confirmTransaction}
                    />
                  </div>
                )}
              </CardContent>
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

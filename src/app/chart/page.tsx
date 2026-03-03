"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useAccumulation } from "@/hooks/use-accumulation";
import { HistoryChart } from "@/components/investment/HistoryChart";
import { TrendingUp } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";

export default function ChartPage() {
  const { user, isLoaded } = useUser();
  const { state, loadingState } = useAccumulation({});

  if (!isLoaded || loadingState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-300 dark:bg-slate-950">
        <div className="text-2xl font-black uppercase tracking-tighter animate-pulse text-black dark:text-white">
          Loading charts...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-300 dark:bg-slate-950">
        <div className="text-xl font-black uppercase bg-white dark:bg-slate-900 border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          Please sign in to view your investment charts
        </div>
      </div>
    );
  }

  const history = state?.history || [];

  return (
    <div className="min-h-screen bg-yellow-300 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white uppercase mb-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] inline-block bg-black dark:bg-slate-900 text-white p-4 transform -rotate-1 border-2 border-white dark:border-white">
              Investment Trends
            </h1>
            <div className="absolute -top-6 -right-6 p-3 bg-white dark:bg-slate-900 text-black dark:text-white rounded-2xl border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-12">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          <div>
            <p className="text-black dark:text-white font-bold text-lg inline-block px-4 py-2 bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase tracking-tight">
              Visualizing your financial journey
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <HistoryChart history={history} />
        </motion.div>

        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-12 text-center border-4 border-dashed border-black/20 dark:border-white/20 rounded-3xl bg-white/5"
          >
            <p className="text-2xl font-black text-black/40 dark:text-white/40 uppercase">
              No transactions found yet. Start by adding one in the calculator!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

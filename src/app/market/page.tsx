"use client";

import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { BtcPriceChart } from "@/components/market/btc-price-chart";

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-yellow-300 dark:bg-slate-950 py-10 sm:mx-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <h1 className="block w-fit text-4xl md:text-5xl font-black tracking-tighter dark:text-white uppercase bg-black dark:bg-slate-900 text-white px-6 py-4 transform -rotate-1 border-2 border-white dark:border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            Market
          </h1>
          <p className="block w-fit text-black dark:text-white font-bold text-lg px-4 py-2 bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase tracking-tight">
            Bitcoin short-term tracker
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <BtcPriceChart />
        </motion.div>
      </div>
    </div>
  );
}

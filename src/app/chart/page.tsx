"use client";

import { useMemo } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";
import { useAccumulation } from "@/hooks/use-accumulation";
import { RecentInvestCard } from "@/components/chart/recent-invest-card";
import { TrackerTabs } from "@/components/chart/tracker-tabs";
import { formatInvestDate } from "@/lib/date-utils";

const FMARKET_SPREADSHEET_ID = "16u_ogbNTrFO119iKRf8fvIMy--Cz3mC0Ja56UzEMny4";
const FMARKET_SHEET_GID = "1096936645";
const CRYPTO_SPREADSHEET_ID = "1kzA4eYqft8gEkht91Bf9fSXkFHw-9aKrKbe7-808gRs";
const CRYPTO_SHEET_GID = "1096936645";

const FMARKET_URL = `https://docs.google.com/spreadsheets/d/${FMARKET_SPREADSHEET_ID}/edit?usp=sharing&gid=${FMARKET_SHEET_GID}`;
const CRYPTO_URL = `https://docs.google.com/spreadsheets/d/${CRYPTO_SPREADSHEET_ID}/edit?usp=sharing&gid=${CRYPTO_SHEET_GID}`;

export default function ChartPage() {
  const { state: accumulationState } = useAccumulation({});

  const recentInvest = useMemo(() => {
    if (!accumulationState || accumulationState.history.length === 0)
      return null;

    const latest = accumulationState.history[0];
    const stocks =
      latest.allocations.find((a) => a.id === "stocks")?.amount || 0;
    const bonds = latest.allocations.find((a) => a.id === "bonds")?.amount || 0;
    const gold = latest.allocations.find((a) => a.id === "gold")?.amount || 0;
    const bitcoin =
      latest.allocations.find((a) => a.id === "bitcoin")?.amount || 0;

    return {
      stocks,
      bonds,
      gold,
      bitcoin,
      total: stocks + bonds + gold + bitcoin,
      date: latest.date,
      formattedDate: formatInvestDate(latest.date),
    };
  }, [accumulationState]);

  return (
    <div className="min-h-screen bg-yellow-300 dark:bg-slate-950 py-10 sm:mx-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white uppercase mb-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] inline-block bg-black dark:bg-slate-900 text-white p-4 transform rotate-1 border-2 border-white dark:border-white">
            Trackers
          </h1>
        </motion.div>

        {/* Recent Investment Calculation Section */}
        <RecentInvestCard recentInvest={recentInvest} />

        {/* Google Sheets Trackers Section */}
        <TrackerTabs fmarketUrl={FMARKET_URL} cryptoUrl={CRYPTO_URL} />
      </div>
    </div>
  );
}

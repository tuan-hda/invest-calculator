"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calculator, Copy, Check } from "lucide-react";

interface RecentInvestData {
  stocks: number;
  bonds: number;
  gold: number;
  total: number;
  date: string;
  formattedDate: string;
}

interface RecentInvestCardProps {
  recentInvest: RecentInvestData | null;
}

export function RecentInvestCard({ recentInvest }: RecentInvestCardProps) {
  const [showRecent, setShowRecent] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedDate, setCopiedDate] = useState(false);

  const copyToClipboard = async (text: string, type: "amount" | "date") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "amount") {
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
      } else {
        setCopiedDate(true);
        setTimeout(() => setCopiedDate(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={() => setShowRecent(!showRecent)}
        className="bg-white dark:bg-slate-900 text-black dark:text-white border-2 border-black dark:border-white font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all py-6 px-8 text-lg"
      >
        <Calculator className="mr-2 h-6 w-6" />
        Calculate Recent Invest
      </Button>

      {showRecent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <CardHeader className="border-b-2 border-black dark:border-white pb-3">
              <CardTitle className="text-xl font-black uppercase flex items-center justify-between">
                <span>Recent Amount</span>
                <TrendingUp className="h-5 w-5" />
              </CardTitle>
              {recentInvest && (
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  As of {recentInvest.formattedDate}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {!recentInvest ? (
                <p className="text-center font-bold text-red-500 py-4 italic">
                  No investment history found!
                </p>
              ) : (
                <>
                  <div className="flex justify-between items-center font-bold border-b border-black/10 dark:border-white/10 pb-2">
                    <span>Stocks</span>
                    <span>
                      {new Intl.NumberFormat("vi-VN").format(
                        recentInvest.stocks,
                      )}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold border-b border-black/10 dark:border-white/10 pb-2">
                    <span>Bonds</span>
                    <span>
                      {new Intl.NumberFormat("vi-VN").format(
                        recentInvest.bonds,
                      )}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold border-b border-black/10 dark:border-white/10 pb-2">
                    <span>Gold</span>
                    <span>
                      {new Intl.NumberFormat("vi-VN").format(recentInvest.gold)}
                      đ
                    </span>
                  </div>

                  <div className="flex justify-between items-center font-bold border-b border-black/10 dark:border-white/10 pb-2">
                    <span>Invested Day</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        {recentInvest.formattedDate}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(recentInvest.formattedDate, "date")
                        }
                        className="h-8 w-8 border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                      >
                        {copiedDate ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xl font-black bg-yellow-200 dark:bg-yellow-900 p-2 border-2 border-black dark:border-white transform -rotate-1">
                    <span>TOTAL</span>
                    <div className="flex items-center gap-2">
                      <span>
                        {new Intl.NumberFormat("vi-VN").format(
                          recentInvest.total,
                        )}
                        đ
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            recentInvest.total.toString(),
                            "amount",
                          )
                        }
                        className="h-8 w-8 bg-white dark:bg-slate-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                      >
                        {copiedAmount ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

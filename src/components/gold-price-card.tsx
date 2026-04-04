"use client";

import { type GoldData } from "@/lib/gold-price-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Coins, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoldPriceCardProps = {
  liveGoldPriceData: GoldData | null;
  loadingLiveGoldPrice: boolean;
  liveGoldPriceError: string | null;
  manualGoldPrice: string;
  isManualGoldPriceActive: boolean;
  onManualGoldPriceChange: (value: string) => void;
  onClearManualGoldPrice: () => void;
  onRefreshLiveGoldPrice: () => void;
};

export function GoldPriceCard({
  liveGoldPriceData,
  loadingLiveGoldPrice,
  liveGoldPriceError,
  manualGoldPrice,
  isManualGoldPriceActive,
  onManualGoldPriceChange,
  onClearManualGoldPrice,
  onRefreshLiveGoldPrice,
}: GoldPriceCardProps) {
  const activePrice = isManualGoldPriceActive
    ? manualGoldPrice || "-"
    : liveGoldPriceData?.price ?? "-";

  const activeUnit = isManualGoldPriceActive
    ? "VNĐ/Chỉ"
    : liveGoldPriceData?.unit ?? "VNĐ/Chỉ";

  const sourceLabel = isManualGoldPriceActive ? "Manual" : "Live";
  const productLabel = isManualGoldPriceActive
    ? liveGoldPriceData?.name ?? "Manual Gold Price Override"
    : liveGoldPriceData?.name ?? "Gold price unavailable";

  return (
    <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
      <CardHeader className="bg-yellow-300 dark:bg-yellow-600 border-b-2 border-black dark:border-white py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="h-6 w-6 text-black dark:text-white" />
            <CardTitle className="text-xl font-black uppercase tracking-tight text-black dark:text-white">
              Gold Price
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefreshLiveGoldPrice}
            disabled={loadingLiveGoldPrice}
            className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/20 rounded-full"
          >
            <RefreshCw
              className={cn("h-4 w-4", loadingLiveGoldPrice && "animate-spin")}
            />
          </Button>
        </div>
        <CardDescription className="text-black/80 dark:text-white/80 font-bold text-xs uppercase tracking-wider">
          DOJI Live Updates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loadingLiveGoldPrice && !liveGoldPriceData && !isManualGoldPriceActive ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Product
              </p>
              <p className="font-bold text-sm leading-tight text-black dark:text-white">
                {productLabel}
              </p>
            </div>

            <div className="flex items-end justify-between border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-4">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Buy Price
                </p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-black dark:text-yellow-400">
                    {activePrice}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white">
                    {activeUnit}
                  </span>
                </div>
              </div>
              <span className="rounded border-2 border-black px-2 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:border-white dark:text-white">
                {sourceLabel}
              </span>
            </div>

            <div className="space-y-2 border-t-2 border-dashed border-gray-200 pt-4 dark:border-gray-700">
              <label className="block text-[10px] font-black uppercase tracking-wide text-gray-500">
                Manual Gold Price
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={manualGoldPrice}
                onChange={(e) =>
                  onManualGoldPriceChange(e.target.value.replace(/[^0-9,]/g, ""))
                }
                placeholder="Enter gold price per chi"
                className="w-full border-2 border-black bg-white px-3 py-2 font-mono font-bold text-sm text-black dark:border-white dark:bg-slate-900 dark:text-white"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={onClearManualGoldPrice}
                  disabled={!manualGoldPrice}
                  className="font-bold uppercase bg-white text-black hover:bg-gray-100 border-2 border-black dark:border-white dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                >
                  Use Live Price
                </Button>
              </div>
            </div>

            {liveGoldPriceError && (
              <div className="rounded border-2 border-red-500 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-300">
                Live price error: {liveGoldPriceError}
              </div>
            )}

            <div className="text-right space-y-2">
              {isManualGoldPriceActive && liveGoldPriceData && (
                <div className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Live reference: {liveGoldPriceData.price} {liveGoldPriceData.unit}
                </div>
              )}
              <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded border border-black dark:border-white">
                Updated: {liveGoldPriceData?.updatedAt ?? "Unavailable"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

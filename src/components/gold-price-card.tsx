"use client";

import { useEffect, useState } from "react";
import { getGoldPrice } from "@/actions/gold-price";
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

type GoldData = {
  price: string;
  unit: string;
  name: string;
  updatedAt: string;
} | null;

export function GoldPriceCard() {
  const [data, setData] = useState<GoldData>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGoldPrice();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            onClick={fetchData}
            disabled={loading}
            className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/20 rounded-full"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
        <CardDescription className="text-black/80 dark:text-white/80 font-bold text-xs uppercase tracking-wider">
          DOJI Live Updates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loading && !data ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500 font-bold">{error}</div>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                Product
              </p>
              <p className="font-bold text-sm leading-tight text-black dark:text-white">
                {data.name}
              </p>
            </div>

            <div className="flex items-end justify-between border-t-2 border-dashed border-gray-200 dark:border-gray-700 pt-4">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Buy Price
                </p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-black dark:text-yellow-400">
                    {data.price}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white">
                    {data.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded border border-black dark:border-white">
                Updated: {data.updatedAt}
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

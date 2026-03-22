"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RangeDays = "1" | "2";

type BtcPricePoint = {
  timestamp: number;
  price: number;
};

type BtcMarketResponse =
  | {
      success: true;
      data: {
        symbol: string;
        currency: string;
        days: number;
        prices: BtcPricePoint[];
      };
    }
  | {
      success: false;
      error: string;
    };

type ChartPoint = BtcPricePoint & {
  label: string;
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatTooltipValue(
  value: number | string | ReadonlyArray<number | string> | undefined,
) {
  if (typeof value === "number" || typeof value === "string") {
    return usdFormatter.format(Number(value));
  }

  return "";
}

function formatXAxisLabel(timestamp: number, days: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: days === 2 ? "short" : undefined,
    day: days === 2 ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export function BtcPriceChart() {
  const [rangeDays, setRangeDays] = useState<RangeDays>("1");
  const [data, setData] = useState<BtcPricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBtcHistory() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/market/btc?days=${rangeDays}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as BtcMarketResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.success ? "Failed to load BTC chart data" : result.error,
          );
        }

        if (!cancelled) {
          setData(result.data.prices);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load BTC chart data",
          );
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBtcHistory();

    return () => {
      cancelled = true;
    };
  }, [rangeDays]);

  const chartData = useMemo<ChartPoint[]>(() => {
    const days = Number(rangeDays);
    return data.map((point) => ({
      ...point,
      label: formatXAxisLabel(point.timestamp, days),
    }));
  }, [data, rangeDays]);

  const latestPrice = data.at(-1)?.price ?? null;
  const earliestPrice = data.at(0)?.price ?? null;

  const change = useMemo(() => {
    if (latestPrice === null || earliestPrice === null) return null;

    const absolute = latestPrice - earliestPrice;
    const percent = earliestPrice === 0 ? 0 : (absolute / earliestPrice) * 100;

    return { absolute, percent };
  }, [earliestPrice, latestPrice]);

  return (
    <Card className="bg-white dark:bg-slate-900">
      <CardHeader className="border-b-2 border-black dark:border-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">
              BTC Price
            </CardTitle>
            <CardDescription className="text-black dark:text-slate-300 font-medium">
              Bitcoin price history over the last 24 to 48 hours.
            </CardDescription>
          </div>

          <Tabs
            value={rangeDays}
            onValueChange={(value) => setRangeDays(value as RangeDays)}
          >
            <TabsList>
              <TabsTrigger value="1">24H</TabsTrigger>
              <TabsTrigger value="2">48H</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-2 border-black dark:border-white bg-yellow-300 dark:bg-slate-950 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
              Current Price
            </p>
            <p className="mt-2 text-3xl font-black text-black dark:text-white">
              {latestPrice === null ? "--" : usdFormatter.format(latestPrice)}
            </p>
          </div>

          <div className="border-2 border-black dark:border-white bg-white dark:bg-slate-950 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
              Period Change
            </p>
            <div className="mt-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-black dark:text-white" />
              <p className="text-2xl font-black text-black dark:text-white">
                {change === null
                  ? "--"
                  : `${change.percent >= 0 ? "+" : ""}${change.percent.toFixed(2)}%`}
              </p>
            </div>
            <p className="mt-1 text-sm font-bold uppercase text-black/70 dark:text-white/70">
              {change === null
                ? "Waiting for data"
                : `${change.absolute >= 0 ? "+" : ""}${usdFormatter.format(change.absolute)}`}
            </p>
          </div>
        </div>

        <div className="h-[340px] w-full rounded-xl border-2 border-black bg-slate-50 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-slate-950 dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading BTC history
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="currentColor"
                  opacity={0.15}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tick={{
                    fontSize: 12,
                    fontWeight: 700,
                    fill: "currentColor",
                  }}
                />
                <YAxis
                  tickFormatter={(value) => compactUsdFormatter.format(value)}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tick={{
                    fontSize: 12,
                    fontWeight: 700,
                    fill: "currentColor",
                  }}
                />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    border: "2px solid black",
                    borderRadius: "0px",
                    boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                    fontWeight: 700,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--color-chart-1)"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: "black",
                    strokeWidth: 2,
                    fill: "var(--color-chart-4)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

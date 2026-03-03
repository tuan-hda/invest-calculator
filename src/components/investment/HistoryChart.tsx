"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Transaction } from "@/lib/accumulation-logic";

interface HistoryChartProps {
  history: Transaction[];
}

export function HistoryChart({ history }: HistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <CardHeader className="border-b-2 border-black dark:border-white pb-4">
          <CardTitle className="uppercase font-black text-2xl tracking-tighter">
            Investment Trends
          </CardTitle>
          <CardDescription className="text-black dark:text-slate-300 font-bold uppercase text-xs">
            No history data available yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  interface ChartDataPoint {
    date: string;
    totalInput: number;
    totalInvested: number;
  }

  // Calculate cumulative investment
  const data = [...history]
    .reverse()
    .reduce((acc: ChartDataPoint[], tx, index) => {
      const previousTotal = index > 0 ? acc[index - 1].totalInvested : 0;
      acc.push({
        date: tx.date,
        totalInput: tx.monthlyAmount,
        totalInvested: previousTotal + tx.monthlyAmount,
      });
      return acc;
    }, []);

  const chartConfig = {
    totalInput: {
      label: "Total Input",
      color: "hsl(var(--primary))",
    },
    totalInvested: {
      label: "Total Invested",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Total Input Chart */}
      <Card className="flex flex-col bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
        <CardHeader className="border-b-2 border-black dark:border-white pb-4 bg-gray-50/50 dark:bg-white/5">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter">
            Total Input
          </CardTitle>
          <CardDescription className="text-black dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">
            Invested amount over time (VND)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={data} margin={{ left: 12, right: 12, top: 12 }}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="font-bold text-[10px] uppercase"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="font-bold text-[10px]"
                tickFormatter={(value) => (value / 1000000).toFixed(1) + "M"}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                }
              />
              <Area
                dataKey="totalInput"
                type="stepAfter"
                fill="var(--color-totalInput)"
                fillOpacity={0.4}
                stroke="var(--color-totalInput)"
                strokeWidth={4}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Total Invested Chart */}
      <Card className="flex flex-col bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
        <CardHeader className="border-b-2 border-black dark:border-white pb-4 bg-gray-50/50 dark:bg-white/5">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter">
            Total Invested
          </CardTitle>
          <CardDescription className="text-black dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">
            Cumulative investment over time (VND)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={data} margin={{ left: 12, right: 12, top: 12 }}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="font-bold text-[10px] uppercase"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                className="font-bold text-[10px]"
                tickFormatter={(value) => (value / 1000000).toFixed(1) + "M"}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                }
              />
              <Area
                dataKey="totalInvested"
                type="monotone"
                fill="var(--color-totalInvested)"
                fillOpacity={0.4}
                stroke="var(--color-totalInvested)"
                strokeWidth={4}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

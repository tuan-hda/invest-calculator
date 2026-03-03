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

  // Get all unique category IDs from history
  const categoryIds = Array.from(
    new Set(history.flatMap((tx) => tx.allocations.map((alloc) => alloc.id))),
  );

  interface ChartDataPoint {
    date: string;
    [key: string]: string | number;
  }

  // Calculate cumulative investment for each category
  const data = [...history]
    .reverse()
    .reduce((acc: ChartDataPoint[], tx, index) => {
      const prevPoint = index > 0 ? acc[index - 1] : {};
      const newPoint: ChartDataPoint = { date: tx.date };

      categoryIds.forEach((id) => {
        const currentAlloc =
          tx.allocations.find((a) => a.id === id)?.amount || 0;
        const prevTotal = (prevPoint[id] as number) || 0;
        newPoint[id] = prevTotal + currentAlloc;
      });

      acc.push(newPoint);
      return acc;
    }, []);

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const chartConfig = categoryIds.reduce((config, id, index) => {
    config[id] = {
      label: id.charAt(0).toUpperCase() + id.slice(1),
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
      <CardHeader className="border-b-2 border-black dark:border-white pb-4 bg-gray-50/50 dark:bg-white/5">
        <CardTitle className="text-2xl font-black uppercase tracking-tighter">
          Portfolio Mix History
        </CardTitle>
        <CardDescription className="text-black dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest">
          Accumulated investment breakdown over time (VND)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
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
            {categoryIds.map((id) => (
              <Area
                key={id}
                dataKey={id}
                type="monotone"
                stackId="1"
                fill={`var(--color-${id})`}
                fillOpacity={0.6}
                stroke={`var(--color-${id})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

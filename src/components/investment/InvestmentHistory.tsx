import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  monthlyAmount: number;
  action: string;
  goldBought: number;
  allocations?: { name: string; amount: number }[];
}

interface InvestmentHistoryProps {
  history: Transaction[];
}

export function InvestmentHistory({ history }: InvestmentHistoryProps) {
  if (!history || history.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <CardHeader className="py-3 border-b-2 border-black dark:border-white">
        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <History className="h-5 w-5" />
          Invest History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-slate-800 sticky top-0">
              <TableRow>
                <TableHead className="font-bold uppercase text-xs w-[100px] pl-4">
                  Date
                </TableHead>
                <TableHead className="font-bold uppercase text-xs text-right">
                  Total Input
                </TableHead>
                <TableHead className="font-bold uppercase text-xs">
                  Breakdown
                </TableHead>
                <TableHead className="font-bold uppercase text-xs">
                  Action
                </TableHead>
                <TableHead className="font-bold uppercase text-xs text-right pr-4">
                  Gold+
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <TableCell className="font-bold text-xs pl-4 py-3 align-top">
                    {tx.date}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right py-3 align-top">
                    {Math.round(tx.monthlyAmount / 1000000)}M
                  </TableCell>
                  <TableCell className="text-xs py-2 align-top">
                    <div className="space-y-1">
                      {tx.allocations?.map((alloc, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between gap-2 text-[10px]"
                        >
                          <span className="text-gray-500 dark:text-gray-400">
                            {alloc.name}
                          </span>
                          <span className="font-mono">
                            {parseFloat((alloc.amount / 1000000).toFixed(1))}M
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium py-3 max-w-[150px] leading-tight whitespace-normal align-top">
                    {tx.action}
                  </TableCell>
                  <TableCell className="font-bold text-xs text-right pr-4 py-3 text-green-600 dark:text-green-400 align-top">
                    {tx.goldBought > 0 ? `${tx.goldBought}` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Trash2 } from "lucide-react";
import { formatDate } from "date-fns";

interface Transaction {
  id: string;
  historyRowId?: string;
  date: string;
  monthlyAmount: number;
  action: string;
  goldBought: number;
  allocations?: {
    name: string;
    amount: number;
    subAllocations?: { name: string; amount: number }[];
  }[];
}

interface InvestmentHistoryProps {
  history: Transaction[];
  onDeleteRows: (rowIds: string[]) => Promise<void>;
  deletingRows?: boolean;
}

export function InvestmentHistory({
  history,
  onDeleteRows,
  deletingRows = false,
}: InvestmentHistoryProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const boundedSelectedCount = useMemo(
    () => Math.min(selectedCount, history.length),
    [history.length, selectedCount],
  );

  const handleToggleRow = (index: number) => {
    if (!history[index]?.historyRowId) return;

    setSelectedCount((current) => {
      const nextCount = Math.min(current, history.length);
      const isSelected = index < nextCount;
      const canSelect = index === nextCount;

      if (isSelected) return index;
      if (canSelect) return nextCount + 1;
      return current;
    });
  };

  const handleDelete = async () => {
    const rowIds = history
      .slice(0, boundedSelectedCount)
      .map((tx) => tx.historyRowId)
      .filter((rowId): rowId is string => Boolean(rowId));

    if (rowIds.length === 0) return;

    await onDeleteRows(rowIds);
    setSelectedCount(0);
  };

  if (!history || history.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      <CardHeader className="py-3 border-b-2 border-black dark:border-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <History className="h-5 w-5" />
            Invest History
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={boundedSelectedCount === 0 || deletingRows}
            className="h-8 gap-2 self-start border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none dark:border-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deletingRows
              ? "Deleting..."
              : `Delete Selected (${boundedSelectedCount})`}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="sm:w-auto w-[calc(100vw-60px)] overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-slate-800 sticky top-0">
              <TableRow>
                <TableHead className="w-12 pl-4" />
                <TableHead className="font-bold uppercase text-xs w-[100px]">
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
              {history.map((tx, index) => {
                const isSelected = index < boundedSelectedCount;
                const canSelect = index === boundedSelectedCount;

                return (
                  <TableRow
                    key={tx.historyRowId ?? tx.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <TableCell className="pl-4 py-3 align-top">
                      <input
                        type="checkbox"
                        aria-label={`Select history row from ${formatDate(
                          tx.date,
                          "dd/MM/yyyy",
                        )}`}
                        checked={isSelected}
                        onChange={() => handleToggleRow(index)}
                        disabled={deletingRows || (!isSelected && !canSelect)}
                        className="h-4 w-4 rounded border-2 border-black accent-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:accent-white"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-xs py-3 align-top">
                      {formatDate(tx.date, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-right py-3 align-top">
                      {Number((tx.monthlyAmount / 1000000).toFixed(3))}M
                    </TableCell>
                    <TableCell className="text-xs py-2 align-top">
                      <div className="space-y-1">
                        {tx.allocations?.map((alloc, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex justify-between gap-2 text-[10px]">
                              <span className="text-gray-500 dark:text-gray-400">
                                {alloc.name}
                              </span>
                              <span className="font-mono">
                                {Number((alloc.amount / 1000000).toFixed(3))}M
                              </span>
                            </div>
                            {alloc.subAllocations?.map((sub, subIdx) => (
                              <div
                                key={subIdx}
                                className="flex justify-between gap-2 text-[10px] pl-3"
                              >
                                <span className="text-gray-400 dark:text-gray-500 italic">
                                  - {sub.name}
                                </span>
                                <span className="font-mono text-gray-400 dark:text-gray-500">
                                  {Number((sub.amount / 1000000).toFixed(3))}M
                                </span>
                              </div>
                            ))}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

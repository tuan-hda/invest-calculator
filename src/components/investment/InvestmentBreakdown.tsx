import React, { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Category } from "@/types/investment";
import { formatCurrency } from "@/lib/utils";

interface InvestmentBreakdownProps {
  amount: number | "";
  categories: Category[];
  proposal: any; // Ideally we export the Proposal type from useAccumulation
  totalPercentage: number;
}

export function InvestmentBreakdown({
  amount,
  categories,
  proposal,
  totalPercentage,
}: InvestmentBreakdownProps) {
  if (amount === "" || amount === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-black/50 dark:text-white/50 min-h-[200px] font-bold uppercase tracking-wider text-center">
        <p>
          Enter an amount
          <br />
          to calculate
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-slate-900 overflow-hidden">
      <Table>
        <TableHeader className="bg-black dark:bg-white">
          <TableRow className="border-b-2 border-black dark:border-white hover:bg-black dark:hover:bg-white">
            <TableHead className="text-white dark:text-black font-bold uppercase tracking-wider">
              Category
            </TableHead>
            <TableHead className="text-right text-white dark:text-black font-bold uppercase tracking-wider">
              Alloc
            </TableHead>
            <TableHead className="text-right text-white dark:text-black font-bold uppercase tracking-wider">
              Amount (VND)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            let marketValue = 0;
            if (proposal && proposal.allocations) {
              const alloc = proposal.allocations.find(
                (a: any) => a.id === category.id,
              );
              marketValue = alloc ? alloc.amount : 0;
            } else {
              marketValue =
                (typeof amount === "number" ? amount : 0) *
                (category.percentage / 100);
            }
            return (
              <Fragment key={category.id}>
                <TableRow className="border-b-2 border-black dark:border-white hover:bg-yellow-100 dark:hover:bg-slate-800 transition-colors">
                  <TableCell className="font-bold text-black dark:text-white border-r-2 border-black dark:border-white">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-black dark:text-white border-r-2 border-black dark:border-white">
                    {category.percentage}%
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-black dark:text-white">
                    {formatCurrency(marketValue)}
                  </TableCell>
                </TableRow>
                {category.subCategories?.map((sub) => {
                  const subValue = marketValue * sub.share;
                  const subPercentage = category.percentage * sub.share;
                  return (
                    <TableRow
                      key={sub.id}
                      className="border-b-2 border-black dark:border-white hover:bg-yellow-50 dark:hover:bg-slate-900/50 transition-colors bg-gray-50/50 dark:bg-slate-900/30"
                    >
                      <TableCell className="pl-8 font-bold text-black/60 dark:text-white/60 italic border-r-2 border-black dark:border-white">
                        - {sub.name}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-black/60 dark:text-white/60 border-r-2 border-black dark:border-white">
                        {subPercentage}%
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-black/60 dark:text-white/60">
                        {formatCurrency(subValue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Fragment>
            );
          })}
          <TableRow className="bg-violet-200 dark:bg-violet-900 font-black border-t-2 border-black dark:border-white hover:bg-violet-300 dark:hover:bg-violet-800">
            <TableCell className="uppercase border-r-2 border-black dark:border-white text-black dark:text-white">
              Total
            </TableCell>
            <TableCell className="text-right border-r-2 border-black dark:border-white text-black dark:text-white">
              {totalPercentage}%
            </TableCell>
            <TableCell className="text-right text-black dark:text-white">
              {formatCurrency(typeof amount === "number" ? amount : 0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

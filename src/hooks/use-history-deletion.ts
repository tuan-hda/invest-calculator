"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CATEGORIES } from "@/constants/investment";
import {
  type AccumulationState,
  type Transaction,
} from "@/lib/accumulation-logic";

type PersistSettings = (
  newState: AccumulationState,
  existingInvestmentId: string | null,
) => Promise<string | null>;

type GetSupabase = () => Promise<SupabaseClient>;

export function buildAccumulationStateFromHistory(
  history: Transaction[],
  currentState: AccumulationState | null,
): AccumulationState {
  const latest = history[0];

  return {
    signedDebt: latest?.signedDebtAfter ?? 0,
    goldCash: latest?.goldCashAfter ?? 0,
    stockCash: latest?.stockCashAfter ?? 0,
    disableInterFundBorrowing:
      currentState?.disableInterFundBorrowing ?? false,
    categories: currentState?.categories ?? DEFAULT_CATEGORIES,
    history,
  };
}

type UseHistoryDeletionParams = {
  getSupabase: GetSupabase;
  investmentId: string | null;
  persistSettings: PersistSettings;
  state: AccumulationState | null;
  setState: Dispatch<SetStateAction<AccumulationState | null>>;
  userId?: string | null;
};

export function useHistoryDeletion({
  getSupabase,
  investmentId,
  persistSettings,
  state,
  setState,
  userId,
}: UseHistoryDeletionParams) {
  const [deletingHistory, setDeletingHistory] = useState(false);

  const deleteHistoryRows = useCallback(
    async (rowIds: string[]) => {
      if (!state || !userId || !investmentId || rowIds.length === 0) return;

      const currentRowIds = state.history.map((tx) => tx.historyRowId);
      const expectedPrefix = currentRowIds.slice(0, rowIds.length);
      const isTopContiguousSelection =
        expectedPrefix.length === rowIds.length &&
        expectedPrefix.every(
          (historyRowId, index) => historyRowId === rowIds[index],
        );

      if (!isTopContiguousSelection) {
        console.error("Rejected non-top history deletion attempt", rowIds);
        return;
      }

      const shouldDelete = confirm(
        `Delete ${rowIds.length} selected transaction${
          rowIds.length === 1 ? "" : "s"
        }?`,
      );

      if (!shouldDelete) return;

      setDeletingHistory(true);

      try {
        const supabase = await getSupabase();
        const { error } = await supabase
          .from("investment_history")
          .delete()
          .eq("investment_id", investmentId)
          .in("id", rowIds);

        if (error) throw error;

        const remainingHistory = state.history.filter(
          (tx) => tx.historyRowId && !rowIds.includes(tx.historyRowId),
        );
        const nextState = buildAccumulationStateFromHistory(
          remainingHistory,
          state,
        );

        setState(nextState);
        await persistSettings(nextState, investmentId);
      } catch (error) {
        console.error("Failed to delete selected history rows:", error);
      } finally {
        setDeletingHistory(false);
      }
    },
    [getSupabase, investmentId, persistSettings, setState, state, userId],
  );

  return {
    deleteHistoryRows,
    deletingHistory,
  };
}

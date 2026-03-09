export type CategoryAllocation = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
};

export type Transaction = {
  id: string;
  date: string;
  monthlyAmount: number;
  goldPrice: number;
  action: string;
  goldBought: number;
  goldCost: number;
  goldOwesStockAfter: number;
  stockOwesGoldAfter: number;
  goldCashAfter: number;
  stockCashAfter: number;
  allocations: CategoryAllocation[];
};

export type AccumulationState = {
  goldOwesStock: number;
  stockOwesGold: number;
  goldCash: number; // accumulated pending cash
  stockCash: number; // accumulated pending cash
  history: Transaction[];
  disableInterFundBorrowing?: boolean; // when true, inter-fund borrowing Won't affect current period
};

export const DEFAULT_STATE: AccumulationState = {
  goldOwesStock: 0,
  stockOwesGold: 0,
  goldCash: 0,
  stockCash: 0,
  history: [],
  disableInterFundBorrowing: false,
};

export const MIN_GOLD_UNIT = 0.5; // chi

export const parseGoldPrice = (priceStr: string): number => {
  return parseFloat(priceStr.replace(/,/g, ""));
};

export function calculateInvestmentProposal(
  amount: number,
  categories: { id: string; name: string; percentage: number }[],
  state: AccumulationState,
  goldPrice: number,
): Transaction {
  debugger;
  const pricePerMinUnit = goldPrice * MIN_GOLD_UNIT;

  // Start with current state
  let { goldOwesStock, stockOwesGold } = {
    ...DEFAULT_STATE,
    ...state,
  };

  let goldCash = DEFAULT_STATE.goldCash;
  let stockCash = DEFAULT_STATE.stockCash;

  // Store original borrowing amounts (will be restored if inter-fund borrowing is disabled)
  const originalGoldOwesStock = goldOwesStock;
  const originalStockOwesGold = stockOwesGold;
  const disableInterFundBorrowing = state.disableInterFundBorrowing ?? false;

  // Calculate initial allocations
  const allocations: CategoryAllocation[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    percentage: cat.percentage,
    amount: amount * (cat.percentage / 100),
  }));

  // Find specific allocations for logic
  const goldAlloc = allocations.find((c) => c.id === "gold")?.amount || 0;
  const stockAlloc = allocations.find((c) => c.id === "stocks")?.amount || 0;

  goldCash += goldAlloc;
  stockCash += stockAlloc;

  let note = "";
  let goldBought = 0;
  let goldCost = 0;

  // Helper to update allocation amounts
  const adjustAllocation = (id: string, delta: number) => {
    const alloc = allocations.find((a) => a.id === id);
    if (alloc) {
      alloc.amount += delta;
    }
  };

  // 1. Repayment Phase - Skip if inter-fund borrowing is disabled
  let goldRepaidStocks = false;
  let stockRepaidGold = false;

  if (!disableInterFundBorrowing) {
    if (goldOwesStock > 0) {
      const maxRepay = goldCash;
      const repayAmount = Math.min(goldOwesStock, maxRepay);
      goldCash -= repayAmount;
      stockCash += repayAmount;
      goldOwesStock -= repayAmount;
      if (repayAmount > 0) {
        goldRepaidStocks = true;
        note += `Trả nợ Stock ${new Intl.NumberFormat("vi-VN").format(repayAmount)}đ. `;
        adjustAllocation("gold", -repayAmount);
        adjustAllocation("stocks", repayAmount);
      }
    } else if (stockOwesGold > 0) {
      const maxRepay = stockCash;
      const repayAmount = Math.min(stockOwesGold, maxRepay);
      stockCash -= repayAmount;
      goldCash += repayAmount;
      stockOwesGold -= repayAmount;
      if (repayAmount > 0) {
        stockRepaidGold = true;
        note += `Nhận nợ Stock ${new Intl.NumberFormat("vi-VN").format(repayAmount)}đ. `;
        adjustAllocation("stocks", -repayAmount);
        adjustAllocation("gold", repayAmount);
      }
    }
  }

  // 2. Buy Phase
  if (goldCash >= pricePerMinUnit) {
    const units = Math.floor(goldCash / pricePerMinUnit);
    const buyAmount = units * MIN_GOLD_UNIT;
    const cost = units * pricePerMinUnit;

    goldCash -= cost;
    goldBought = buyAmount;
    goldCost = cost;
    note += `Mua ${buyAmount} chỉ. `;

    // Handle leftover: transfer it to stocks if not repaid gold this period
    if (goldCash > 0 && !stockRepaidGold && !disableInterFundBorrowing) {
      const leftover = goldCash;
      goldCash -= leftover;
      stockCash += leftover;
      stockOwesGold += leftover;
      note += `Dồn ${new Intl.NumberFormat("vi-VN").format(leftover)}đ sang Stock. `;
      adjustAllocation("gold", -leftover);
      adjustAllocation("stocks", leftover);
    }
  } else {
    // Borrowing Logic - Skip if inter-fund borrowing is disabled
    if (!disableInterFundBorrowing) {
      const missing = pricePerMinUnit - goldCash;
      const maxBorrow = stockCash;

      if (missing > 0 && missing <= maxBorrow && !goldRepaidStocks) {
        stockCash -= missing;
        goldCash += missing;
        goldOwesStock += missing;
        note += `Vay Stock ${new Intl.NumberFormat("vi-VN").format(missing)}đ. `;
        adjustAllocation("stocks", -missing);
        adjustAllocation("gold", missing);

        goldBought = MIN_GOLD_UNIT;
        goldCost = pricePerMinUnit;
        goldCash -= goldCost;
        note += `Mua 0.5 chỉ. `;
      } else {
        // Transfer leftover if not repaid gold
        if (goldCash > 0 && !stockRepaidGold) {
          const transfer = goldCash;
          goldCash -= transfer;
          stockCash += transfer;
          stockOwesGold += transfer;
          note += `Dồn ${new Intl.NumberFormat("vi-VN").format(transfer)}đ sang Stock. `;
          adjustAllocation("gold", -transfer);
          adjustAllocation("stocks", transfer);
        }
      }
    } else {
      // When borrowing is disabled, just transfer leftover gold to stocks without creating debt
      if (goldCash > 0) {
        const transfer = goldCash;
        goldCash -= transfer;
        stockCash += transfer;
        note += `Dồn ${new Intl.NumberFormat("vi-VN").format(transfer)}đ sang Stock. `;
        adjustAllocation("gold", -transfer);
        adjustAllocation("stocks", transfer);
      }
    }
  }

  // Restore original borrowing amounts if borrowing is disabled
  if (disableInterFundBorrowing) {
    goldOwesStock = originalGoldOwesStock;
    stockOwesGold = originalStockOwesGold;
  }

  return {
    id: Date.now().toString(),
    date: new Date().toLocaleDateString("vi-VN"),
    monthlyAmount: amount,
    goldPrice: goldPrice,
    action: note,
    goldBought,
    goldCost,
    goldOwesStockAfter: goldOwesStock,
    stockOwesGoldAfter: stockOwesGold,
    goldCashAfter: goldCash,
    stockCashAfter: stockCash,
    allocations,
  };
}

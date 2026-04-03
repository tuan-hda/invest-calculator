import { DEFAULT_CATEGORIES } from "@/constants/investment";
import { Category } from "@/types/investment";

export type CategoryAllocation = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  subAllocations?: {
    id: string;
    name: string;
    share: number;
    amount: number;
    percentage: number;
  }[];
};

export type DebtDirection = "gold_owes_stock" | "stock_owes_gold" | "none";

export type DebtDisplay = {
  direction: DebtDirection;
  amount: number;
  label: string;
};

export type Transaction = {
  id: string;
  date: string;
  monthlyAmount: number;
  goldPrice: number;
  goldPriceSource: "live" | "manual";
  action: string;
  goldBought: number;
  goldCost: number;
  signedDebtAfter: number;
  debtDisplayAfter: DebtDisplay;
  goldCashAfter: number;
  stockCashAfter: number;
  allocations: CategoryAllocation[];
};

export type AccumulationState = {
  signedDebt: number;
  goldCash: number;
  stockCash: number;
  history: Transaction[];
  disableInterFundBorrowing?: boolean;
  categories?: Category[];
};

export type PreCalculationInput = {
  amount: number;
  categories: Category[];
  goldPrice: number;
  signedDebt: number;
  interchangeEnabled: boolean;
};

export type CalculationEvent =
  | {
      type: "repayment";
      amount: number;
      from: "gold" | "stock";
    }
  | {
      type: "borrow";
      amount: number;
      from: "stock";
    }
  | {
      type: "buy";
      goldBought: number;
      cost: number;
    }
  | {
      type: "transfer";
      amount: number;
      from: "gold";
      createsDebt: boolean;
    };

export type RawCalculationResult = {
  monthlyAmount: number;
  goldPrice: number;
  pricePerMinUnit: number;
  startingDebt: number;
  signedDebtAfter: number;
  goldBought: number;
  goldCost: number;
  goldCashAfter: number;
  stockCashAfter: number;
  initialAllocations: CategoryAllocation[];
  finalAllocations: CategoryAllocation[];
  events: CalculationEvent[];
};

export const DEFAULT_STATE: AccumulationState = {
  signedDebt: 0,
  goldCash: 0,
  stockCash: 0,
  history: [],
  disableInterFundBorrowing: false,
  categories: DEFAULT_CATEGORIES,
};

export const MIN_GOLD_UNIT = 0.5;

const currencyFormatter = new Intl.NumberFormat("vi-VN");

export const parseGoldPrice = (priceStr: string): number => {
  return parseFloat(priceStr.replace(/,/g, ""));
};

export function toSignedDebt(
  goldOwesStock: number,
  stockOwesGold: number,
): number {
  if (goldOwesStock > 0) return goldOwesStock;
  if (stockOwesGold > 0) return -stockOwesGold;
  return 0;
}

export function toDirectionalDebt(signedDebt: number) {
  return {
    goldOwesStock: Math.max(signedDebt, 0),
    stockOwesGold: Math.max(-signedDebt, 0),
  };
}

export function formatSignedDebt(signedDebt: number): DebtDisplay {
  if (signedDebt > 0) {
    return {
      direction: "gold_owes_stock",
      amount: signedDebt,
      label: "Gold owes Stock",
    };
  }

  if (signedDebt < 0) {
    return {
      direction: "stock_owes_gold",
      amount: Math.abs(signedDebt),
      label: "Stock owes Gold",
    };
  }

  return {
    direction: "none",
    amount: 0,
    label: "No outstanding debt",
  };
}

function buildInitialAllocations(
  amount: number,
  categories: Category[],
): CategoryAllocation[] {
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    percentage: cat.percentage,
    amount: amount * (cat.percentage / 100),
    subAllocations: cat.subCategories?.map((sub) => ({
      ...sub,
      amount: amount * (cat.percentage / 100) * sub.share,
      percentage: cat.percentage * sub.share,
    })),
  }));
}

function cloneAllocations(
  allocations: CategoryAllocation[],
): CategoryAllocation[] {
  return allocations.map((allocation) => ({
    ...allocation,
    subAllocations: allocation.subAllocations?.map((sub) => ({ ...sub })),
  }));
}

function adjustAllocation(
  allocations: CategoryAllocation[],
  id: string,
  delta: number,
) {
  const allocation = allocations.find((item) => item.id === id);
  if (allocation) {
    allocation.amount += delta;
  }
}

function assertNonNegative(value: number, label: string) {
  if (value < -0.0001) {
    throw new Error(`${label} became negative`);
  }
}

function assertCalculationInvariants(result: RawCalculationResult) {
  assertNonNegative(result.goldCashAfter, "goldCashAfter");
  assertNonNegative(result.stockCashAfter, "stockCashAfter");
  assertNonNegative(result.goldCost, "goldCost");

  if (Math.abs(result.goldCashAfter) > 0.0001) {
    throw new Error("goldCashAfter must resolve to 0");
  }

  const units = result.goldBought / MIN_GOLD_UNIT;
  if (!Number.isInteger(units)) {
    throw new Error("goldBought must be in 0.5 chi increments");
  }
}

export function calculateAccumulation(
  input: PreCalculationInput,
): RawCalculationResult {
  const { amount, categories, goldPrice, interchangeEnabled } = input;
  const startingDebt = input.signedDebt;
  const pricePerMinUnit = goldPrice * MIN_GOLD_UNIT;

  const initialAllocations = buildInitialAllocations(amount, categories);
  const finalAllocations = cloneAllocations(initialAllocations);

  let signedDebt = startingDebt;
  let goldCash =
    initialAllocations.find((allocation) => allocation.id === "gold")?.amount ??
    0;
  let stockCash =
    initialAllocations.find((allocation) => allocation.id === "stocks")
      ?.amount ?? 0;

  let goldBought = 0;
  let goldCost = 0;
  let goldRepaidExistingDebt = false;

  const events: CalculationEvent[] = [];

  if (interchangeEnabled && signedDebt !== 0) {
    if (signedDebt > 0) {
      const repayAmount = Math.min(goldCash, signedDebt);
      if (repayAmount > 0) {
        goldCash -= repayAmount;
        stockCash += repayAmount;
        signedDebt -= repayAmount;
        goldRepaidExistingDebt = true;
        adjustAllocation(finalAllocations, "gold", -repayAmount);
        adjustAllocation(finalAllocations, "stocks", repayAmount);
        events.push({
          type: "repayment",
          amount: repayAmount,
          from: "gold",
        });
      }
    } else {
      const repayAmount = Math.min(stockCash, Math.abs(signedDebt));
      if (repayAmount > 0) {
        stockCash -= repayAmount;
        goldCash += repayAmount;
        signedDebt += repayAmount;
        adjustAllocation(finalAllocations, "stocks", -repayAmount);
        adjustAllocation(finalAllocations, "gold", repayAmount);
        events.push({
          type: "repayment",
          amount: repayAmount,
          from: "stock",
        });
      }
    }
  }

  if (goldCash >= pricePerMinUnit) {
    const units = Math.floor(goldCash / pricePerMinUnit);
    goldBought = units * MIN_GOLD_UNIT;
    goldCost = units * pricePerMinUnit;
    goldCash -= goldCost;

    if (goldBought > 0) {
      events.push({
        type: "buy",
        goldBought,
        cost: goldCost,
      });
    }
  } else if (
    interchangeEnabled &&
    !goldRepaidExistingDebt &&
    goldCash > 0 &&
    stockCash >= pricePerMinUnit - goldCash
  ) {
    const borrowAmount = pricePerMinUnit - goldCash;
    stockCash -= borrowAmount;
    goldCash += borrowAmount;
    signedDebt += borrowAmount;
    adjustAllocation(finalAllocations, "stocks", -borrowAmount);
    adjustAllocation(finalAllocations, "gold", borrowAmount);
    events.push({
      type: "borrow",
      amount: borrowAmount,
      from: "stock",
    });

    goldBought = MIN_GOLD_UNIT;
    goldCost = pricePerMinUnit;
    goldCash -= goldCost;
    events.push({
      type: "buy",
      goldBought,
      cost: goldCost,
    });
  }

  if (goldCash > 0) {
    const transferAmount = goldCash;
    goldCash = 0;
    stockCash += transferAmount;
    adjustAllocation(finalAllocations, "gold", -transferAmount);
    adjustAllocation(finalAllocations, "stocks", transferAmount);

    if (interchangeEnabled) {
      signedDebt -= transferAmount;
    }

    events.push({
      type: "transfer",
      amount: transferAmount,
      from: "gold",
      createsDebt: interchangeEnabled,
    });
  }

  const result: RawCalculationResult = {
    monthlyAmount: amount,
    goldPrice,
    pricePerMinUnit,
    startingDebt,
    signedDebtAfter: signedDebt,
    goldBought,
    goldCost,
    goldCashAfter: goldCash,
    stockCashAfter: stockCash,
    initialAllocations,
    finalAllocations,
    events,
  };

  assertCalculationInvariants(result);
  return result;
}

export function formatCalculationResult(
  result: RawCalculationResult,
  options?: { goldPriceSource?: "live" | "manual" },
): Transaction {
  const actionParts = result.events.map((event) => {
    if (event.type === "repayment") {
      const target = event.from === "gold" ? "Stock" : "Gold";
      return `Trả nợ ${target} ${currencyFormatter.format(event.amount)}đ.`;
    }

    if (event.type === "borrow") {
      return `Vay Stock ${currencyFormatter.format(event.amount)}đ.`;
    }

    if (event.type === "buy") {
      return `Mua ${event.goldBought} chỉ.`;
    }

    return `Dồn ${currencyFormatter.format(event.amount)}đ sang Stock.`;
  });

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    monthlyAmount: result.monthlyAmount,
    goldPrice: result.goldPrice,
    goldPriceSource: options?.goldPriceSource ?? "live",
    action: actionParts.join(" "),
    goldBought: result.goldBought,
    goldCost: result.goldCost,
    signedDebtAfter: result.signedDebtAfter,
    debtDisplayAfter: formatSignedDebt(result.signedDebtAfter),
    goldCashAfter: result.goldCashAfter,
    stockCashAfter: result.stockCashAfter,
    allocations: cloneAllocations(result.finalAllocations),
  };
}

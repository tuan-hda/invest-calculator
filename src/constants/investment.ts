import { Category } from "@/types/investment";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "stocks",
    name: "Quỹ cổ phiếu",
    percentage: 65,
    subCategories: [
      { id: "dcds", name: "DCDS", share: 0.5 },
      { id: "vcbf-bcf", name: "VCBF-BCF", share: 0.5 },
    ],
  },
  {
    id: "bonds",
    name: "Quỹ trái phiếu",
    percentage: 10,
    subCategories: [{ id: "vcbf-fif", name: "VCBF-FIF", share: 1 }],
  },
  { id: "gold", name: "Vàng", percentage: 20 },
  { id: "savings", name: "Tiết kiệm", percentage: 0 },
  { id: "bitcoin", name: "Bitcoin", percentage: 5 },
];

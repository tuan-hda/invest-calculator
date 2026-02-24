import { Category } from "@/types/investment";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "stocks",
    name: "Quỹ cổ phiếu",
    percentage: 25,
    subCategories: [
      { id: "vesaf", name: "VESAF", share: 0.5 },
      { id: "ssisca", name: "SSISCA", share: 0.5 },
    ],
  },
  {
    id: "bonds",
    name: "Quỹ trái phiếu",
    percentage: 15,
    subCategories: [{ id: "vcbf-fif", name: "VCBF-FIF", share: 1 }],
  },
  { id: "gold", name: "Vàng", percentage: 35 },
  { id: "savings", name: "Tiết kiệm", percentage: 20 },
  { id: "bitcoin", name: "Bitcoin", percentage: 5 },
];

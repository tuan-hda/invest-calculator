export type SubCategory = {
  id: string;
  name: string;
  share: number;
};

export type Category = {
  id: string;
  name: string;
  percentage: number;
  subCategories?: SubCategory[];
};

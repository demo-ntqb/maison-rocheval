export type ProductsProductKey =
  | "amur"
  | "kaluga"
  | "russianHybrid"
  | "expression"
  | "harmonie";

export interface ProductsProduct {
  id: string;
  handle: string;
  imageBasePath: string;
  imageHeight: number;
  imageWidth: number;
  plumbCardId: string;
  plumbImageId: string;
  translationKey: ProductsProductKey;
}

export interface ProductsProductContent {
  description: string;
  eyebrow: string;
  imageAlt: string;
  profile: string;
  species: string;
  title: string;
}

export interface ProductsProductViewModel extends ProductsProduct {
  content: ProductsProductContent;
}

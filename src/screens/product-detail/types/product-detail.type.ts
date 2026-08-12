import type { Product } from "@/shared/components/composite/product-card";

export interface PackagingOption {
  id: string;
  name: string;
  description?: string;
  priceModifier: number;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface ProductSpecs {
  pearlSize: string;
  salt: string;
  color: string;
  tastingNotes: string;
  ingredients: string;
  nutritionalData: string;
}

export interface ProductAccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface DetailedProduct extends Product {
  price: number;
  bestSeller?: boolean;
  galleryImages: string[];
  sizes: string[];
  packagingOptions: PackagingOption[];
  perBoxOptions: number[];
  specsDescription: string;
  specs: ProductSpecs;
  servingInfo: {
    shelfLife: string;
    recommendation: string;
  };
  deliveryInfo: {
    shipping: string;
    deliveryTime: string;
  };
  giftingInfo: {
    wrapping: string;
    message: string;
  };
  accordionItems?: ProductAccordionItem[];
}


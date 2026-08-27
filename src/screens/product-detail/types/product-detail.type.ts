import type {
  CatalogVariant,
} from "@/shared/types/catalog.type";

export type ProductSelection = Readonly<{
  quantity: number;
  size: string;
}>;

export type ProductSelectionAction =
  | { quantity: number; type: "set-quantity" }
  | { size: string; type: "select-size" };

export type ProductSelectionView = Readonly<{
  activeVariant: CatalogVariant | undefined;
  currencyCode: string;
  totalPrice: number;
}>;



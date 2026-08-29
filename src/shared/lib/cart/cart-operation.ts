import type { CartGiftMessage, CartLineImage, CartMoney } from "@/shared/types/cart.type";

export type OptimisticProductData = {
  image: CartLineImage | null;
  title: string;
  weight: string;
  unitPrice: CartMoney;
  quantityAvailable: number | null;
};

export type AddCaviarOperation = {
  id: string;
  type: "add_caviar";
  createdAt: number;
  merchandiseId: string;
  productId: string;
  quantity: number;
  /** Absolute quantity expected after this explicit Add transaction. */
  targetQuantity: number;
  optimistic: OptimisticProductData;
};

export type AddGiftOperation = {
  id: string;
  type: "add_gift";
  createdAt: number;
  merchandiseId: string;
  productId: string;
  units: Array<{ unitId: string }>;
  group: { addHref?: string; title: string };
  optimistic: OptimisticProductData;
};

export type SetQuantityOperation = {
  id: string;
  type: "set_quantity";
  createdAt: number;
  lineId: string;
  merchandiseId: string;
  quantity: number;
};

export type RemoveOperation = {
  id: string;
  type: "remove";
  createdAt: number;
  lineId: string;
  merchandiseId: string;
  unitId: string | null;
};

export type GiftMessageOperation = {
  id: string;
  type: "gift_message";
  createdAt: number;
  lineId: string;
  merchandiseId: string;
  unitId: string | null;
  giftMessage: CartGiftMessage | null;
};

export type PendingCartOperation =
  | AddCaviarOperation
  | AddGiftOperation
  | SetQuantityOperation
  | RemoveOperation
  | GiftMessageOperation;

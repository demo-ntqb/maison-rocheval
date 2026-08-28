export type CartLineImage = {
  altText: string;
  height: number;
  url: string;
  width: number;
};

/**
 * A gift card is either left blank or carries a hand-written note; the cart
 * line keeps whichever the shopper picked in the message dialog.
 */
export type CartGiftMessage =
  | { kind: "blank" }
  | { kind: "personal"; text: string };

export type CartLine = {
  currencyCode: string;
  giftMessage?: CartGiftMessage;
  id: string;
  merchandiseId: string;
  image: CartLineImage | null;
  quantity: number;
  /** Gift-set components ship in a fixed composition — no stepper for those. */
  quantityEditable: boolean;
  supportsGiftMessage: boolean;
  title: string;
  unitPrice: number;
  weight: string;
  quantityAvailable?: number | null;
};

/** A gift set: one card holding every component line under a shared heading. */
export type CartGroup = {
  addHref?: string;
  id: string;
  lines: CartLine[];
  title: string;
};

export type CartEntry =
  | { group: CartGroup; kind: "group" }
  | { kind: "line"; line: CartLine };

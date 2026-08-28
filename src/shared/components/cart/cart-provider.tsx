"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import type {
  CartEntry,
  CartGiftMessage,
  CartLine,
  CartLineImage,
} from "@/shared/types/cart.type";

/** What the product detail "Add to cart" button sends for a standalone item (caviar). */
export type AddCartLineInput = {
  currencyCode: string;
  id: string;
  image: CartLineImage | null;
  quantity: number;
  title: string;
  unitPrice: number;
  weight: string;
  quantityAvailable?: number | null;
};

/**
 * What the product detail "Add to cart" button sends for a gift set. Each unit
 * of `quantity` becomes its own line inside the group so every physical box
 * can carry its own gift message — matching how the design lists two separate
 * "L'Initiation" lines under one heading rather than a single line at qty 2.
 */
export type AddGiftSetInput = {
  group: { addHref?: string; id: string; title: string };
  quantity: number;
  unit: Omit<AddCartLineInput, "quantity">;
};

type CartContextValue = {
  addGiftSetUnits: (input: AddGiftSetInput) => void;
  addLine: (input: AddCartLineInput) => void;
  checkout: () => void;
  checkoutUrl: string | null;
  close: () => void;
  currencyCode: string;
  entries: CartEntry[];
  isCheckingOut: boolean;
  isOpen: boolean;
  itemCount: number;
  open: () => void;
  removeLine: (lineId: string) => void;
  setGiftMessage: (lineId: string, giftMessage: CartGiftMessage | undefined) => void;
  setLineQuantity: (lineId: string, quantity: number) => void;
  setOpen: (open: boolean) => void;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const DEFAULT_CURRENCY = "EUR";

function createCartLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapEntryLines(entry: CartEntry, map: (line: CartLine) => CartLine | null): CartEntry | null {
  if (entry.kind === "line") {
    const line = map(entry.line);
    return line ? { kind: "line", line } : null;
  }

  const lines = entry.group.lines.map(map).filter((line): line is CartLine => line !== null);
  return lines.length > 0 ? { group: { ...entry.group, lines }, kind: "group" } : null;
}

function flattenLines(entries: CartEntry[]): CartLine[] {
  return entries.flatMap((entry) => (entry.kind === "line" ? [entry.line] : entry.group.lines));
}

export interface CartProviderProps {
  children: React.ReactNode;
  /** Cart contents are supplied by the caller until the Shopify cart transport lands. */
  initialEntries?: CartEntry[];
  initialOpen?: boolean;
  initialCheckoutUrl?: string | null;
  routeLocale: string;
}

export function CartProvider({
  children,
  initialEntries = [],
  initialOpen = false,
  initialCheckoutUrl = null,
  routeLocale,
}: CartProviderProps) {
  const [entries, setEntries] = useState<CartEntry[]>(initialEntries);
  const [isOpen, setOpen] = useState(initialOpen);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(initialCheckoutUrl);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const removeLine = useCallback((lineId: string) => {
    setEntries((current) =>
      current
        .map((entry) => mapEntryLines(entry, (line) => (line.id === lineId ? null : line)))
        .filter((entry): entry is CartEntry => entry !== null),
    );
  }, []);

  const setLineQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }

    setEntries((current) =>
      current
        .map((entry) =>
          mapEntryLines(entry, (line) => {
            if (line.id === lineId) {
              const maxQty = line.quantityAvailable ?? 99;
              return { ...line, quantity: Math.min(quantity, maxQty) };
            }
            return line;
          }),
        )
        .filter((entry): entry is CartEntry => entry !== null),
    );
  }, []);

  const setGiftMessage = useCallback((lineId: string, giftMessage: CartGiftMessage | undefined) => {
    setEntries((current) =>
      current
        .map((entry) => mapEntryLines(entry, (line) => (line.id === lineId ? { ...line, giftMessage } : line)))
        .filter((entry): entry is CartEntry => entry !== null),
    );
  }, []);

  /**
   * Caviar lines are quantity-editable and stack: adding the same SKU again
   * bumps the existing line instead of duplicating it, same as any standard
   * cart.
   */
  const addLine = useCallback((input: AddCartLineInput) => {
    if (input.quantity < 1) {
      return;
    }

    setEntries((current) => {
      const index = current.findIndex((entry) => entry.kind === "line" && entry.line.id === input.id);

      if (index >= 0) {
        const existing = current[index] as Extract<CartEntry, { kind: "line" }>;
        const next = [...current];
        
        const maxQty = existing.line.quantityAvailable ?? 99;
        const targetQty = Math.min(existing.line.quantity + input.quantity, maxQty);

        next[index] = {
          kind: "line",
          line: { ...existing.line, quantity: targetQty },
        };
        return next;
      }

      const maxQty = input.quantityAvailable ?? 99;
      const targetQty = Math.min(input.quantity, maxQty);

      return [
        ...current,
        {
          kind: "line",
          line: {
            currencyCode: input.currencyCode,
            id: input.id,
            merchandiseId: input.id,
            image: input.image,
            quantity: targetQty,
            quantityEditable: true,
            supportsGiftMessage: false,
            title: input.title,
            unitPrice: input.unitPrice,
            weight: input.weight,
            quantityAvailable: input.quantityAvailable,
          },
        },
      ];
    });
    setOpen(true);
  }, []);

  /**
   * Gift sets are not quantity-editable per line — each unit gets its own row
   * (and its own gift message) inside a shared group card, appending to an
   * existing group for the same product if one is already in the bag.
   */
  const addGiftSetUnits = useCallback(({ group, quantity, unit }: AddGiftSetInput) => {
    if (quantity < 1) {
      return;
    }

    setEntries((current) => {
      const index = current.findIndex((entry) => entry.kind === "group" && entry.group.id === group.id);
      const existingCount = index >= 0 ? (current[index] as Extract<CartEntry, { kind: "group" }>).group.lines.length : 0;

      const maxQty = unit.quantityAvailable ?? 99;
      const allowedAddQty = Math.max(0, maxQty - existingCount);
      const targetAddQty = Math.min(quantity, allowedAddQty);

      if (targetAddQty < 1) {
        return current;
      }

      const newLines: CartLine[] = Array.from({ length: targetAddQty }, () => ({
        currencyCode: unit.currencyCode,
        id: createCartLineId(),
        merchandiseId: unit.id,
        image: unit.image,
        quantity: 1,
        quantityEditable: false,
        supportsGiftMessage: true,
        title: unit.title,
        unitPrice: unit.unitPrice,
        weight: unit.weight,
        quantityAvailable: unit.quantityAvailable,
      }));

      if (index >= 0) {
        const existing = current[index] as Extract<CartEntry, { kind: "group" }>;
        const next = [...current];
        next[index] = {
          group: { ...existing.group, lines: [...existing.group.lines, ...newLines] },
          kind: "group",
        };
        return next;
      }

      return [
        ...current,
        {
          group: { addHref: group.addHref, id: group.id, lines: newLines, title: group.title },
          kind: "group",
        },
      ];
    });
    setOpen(true);
  }, []);

  const checkout = useCallback(async () => {
    if (typeof window === "undefined" || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/cart", {
        body: JSON.stringify({
          locale: routeLocale,
          lines: flattenLines(entries).map((line) => ({ merchandiseId: line.merchandiseId, quantity: line.quantity })),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload: unknown = await response.json();
      const nextCheckoutUrl =
        typeof payload === "object" && payload !== null && "checkoutUrl" in payload && typeof payload.checkoutUrl === "string"
          ? payload.checkoutUrl
          : null;
      if (!response.ok || !nextCheckoutUrl) return;
      setCheckoutUrl(nextCheckoutUrl);
      window.location.assign(nextCheckoutUrl);
    } finally {
      setIsCheckingOut(false);
    }
  }, [entries, isCheckingOut, routeLocale]);

  const value = useMemo<CartContextValue>(() => {
    const lines = flattenLines(entries);

    return {
      addGiftSetUnits,
      addLine,
      checkout,
      checkoutUrl,
      close: () => setOpen(false),
      currencyCode: lines[0]?.currencyCode ?? DEFAULT_CURRENCY,
      entries,
      isCheckingOut,
      isOpen,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      open: () => setOpen(true),
      removeLine,
      setGiftMessage,
      setLineQuantity,
      setOpen,
      totalPrice: lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0),
    };
  }, [addGiftSetUnits, addLine, checkout, checkoutUrl, entries, isCheckingOut, isOpen, removeLine, setGiftMessage, setLineQuantity]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a <CartProvider>");
  }

  return context;
}

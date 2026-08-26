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
  unit: Omit<AddCartLineInput, "id" | "quantity">;
};

type CartContextValue = {
  addGiftSetUnits: (input: AddGiftSetInput) => void;
  addLine: (input: AddCartLineInput) => void;
  close: () => void;
  currencyCode: string;
  entries: CartEntry[];
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
}

export function CartProvider({ children, initialEntries = [], initialOpen = false }: CartProviderProps) {
  const [entries, setEntries] = useState<CartEntry[]>(initialEntries);
  const [isOpen, setOpen] = useState(initialOpen);

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
        .map((entry) => mapEntryLines(entry, (line) => (line.id === lineId ? { ...line, quantity } : line)))
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
        next[index] = {
          kind: "line",
          line: { ...existing.line, quantity: existing.line.quantity + input.quantity },
        };
        return next;
      }

      return [
        ...current,
        {
          kind: "line",
          line: {
            currencyCode: input.currencyCode,
            id: input.id,
            image: input.image,
            quantity: input.quantity,
            quantityEditable: true,
            supportsGiftMessage: false,
            title: input.title,
            unitPrice: input.unitPrice,
            weight: input.weight,
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
      const newLines: CartLine[] = Array.from({ length: quantity }, () => ({
        currencyCode: unit.currencyCode,
        id: createCartLineId(),
        image: unit.image,
        quantity: 1,
        quantityEditable: false,
        supportsGiftMessage: true,
        title: unit.title,
        unitPrice: unit.unitPrice,
        weight: unit.weight,
      }));

      const index = current.findIndex((entry) => entry.kind === "group" && entry.group.id === group.id);

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

  const value = useMemo<CartContextValue>(() => {
    const lines = flattenLines(entries);

    return {
      addGiftSetUnits,
      addLine,
      close: () => setOpen(false),
      currencyCode: lines[0]?.currencyCode ?? DEFAULT_CURRENCY,
      entries,
      isOpen,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      open: () => setOpen(true),
      removeLine,
      setGiftMessage,
      setLineQuantity,
      setOpen,
      totalPrice: lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0),
    };
  }, [addGiftSetUnits, addLine, entries, isOpen, removeLine, setGiftMessage, setLineQuantity]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a <CartProvider>");
  }

  return context;
}

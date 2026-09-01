"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounceCallback } from "usehooks-ts";

import {
  addLine as addLineRequest,
  fetchCart,
  fetchCheckout,
  removeLine as removeLineRequest,
  updateGiftMessage as updateGiftMessageRequest,
  updateQuantity as updateQuantityRequest,
  updateRegion as updateRegionRequest,
} from "@/shared/lib/cart/cart-api";
import { countGiftUnitsByVariant, flattenCartLines } from "@/shared/lib/cart/cart-entry";
import { multiplyMoney, sumMoney } from "@/shared/lib/cart/cart-money";
import { getCommerceContextOrDefault } from "@/shared/lib/commerce-context";
import type {
  CartEntry,
  CartGiftMessage,
  CartMoney,
  CartSnapshot,
  OptimisticProductData,
} from "@/shared/types/cart.type";
import type { RouteLocale } from "@/shared/types/commerce-context.type";

export type AddCartLineInput = {
  merchandiseId: string;
  quantity: number;
  productId?: string;
  optimistic?: OptimisticProductData;
};

export type AddGiftSetInput = {
  merchandiseId: string;
  quantity: number;
  productId?: string;
  group?: { addHref?: string; title: string };
  optimistic?: OptimisticProductData;
};

type CartContextValue = {
  addGiftSetUnits: (input: AddGiftSetInput) => Promise<void> | void;
  addLine: (input: AddCartLineInput) => Promise<void> | void;
  checkout: () => Promise<void>;
  close: () => void;
  entries: CartEntry[];
  isCheckingOut: boolean;
  isMutating: boolean;
  isOpen: boolean;
  itemCount: number;
  open: () => void;
  removeLine: (lineId: string) => Promise<void> | void;
  setGiftMessage: (lineId: string, giftMessage: CartGiftMessage | null | undefined) => Promise<void> | void;
  setLineQuantity: (lineId: string, quantity: number) => Promise<void> | void;
  setOpen: (open: boolean) => void;
  subtotal: CartMoney;
  updateRegion: (locale: RouteLocale) => Promise<void>;
  cartError: "itemUnavailable" | null;
  checkoutError: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

const hasStockWarning = (cart: CartSnapshot) =>
  cart.warnings.some((w) => w.code.toUpperCase().includes("STOCK"));

function createEmptySnapshot(routeLocale: RouteLocale): CartSnapshot {
  const context = getCommerceContextOrDefault(routeLocale);
  return {
    entries: [],
    itemCount: 0,
    subtotal: { amount: "0.00", currencyCode: context.country === "SG" ? "SGD" : "SGD" },
    countryCode: context.country,
    warnings: [],
  };
}

function snapshotFromEntries(routeLocale: RouteLocale, entries: CartEntry[]): CartSnapshot {
  const empty = createEmptySnapshot(routeLocale);
  const lines = flattenCartLines(entries);
  return {
    ...empty,
    entries,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: sumMoney(lines.map((line) => line.subtotal), empty.subtotal.currencyCode),
  };
}

function applyQuantityLocally(current: CartSnapshot, lineId: string, quantity: number): CartSnapshot {
  const entries = current.entries.map((entry): CartEntry => {
    if (entry.kind === "line" && entry.line.id === lineId) {
      return {
        kind: "line",
        line: { ...entry.line, quantity, subtotal: multiplyMoney(entry.line.unitPrice, quantity) },
      };
    }
    return entry;
  });

  const lines = flattenCartLines(entries);
  return {
    ...current,
    entries,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: sumMoney(lines.map((line) => line.subtotal), current.subtotal.currencyCode),
  };
}

export interface CartProviderProps {
  children: ReactNode;
  initialEntries?: CartEntry[];
  initialOpen?: boolean;
  routeLocale: string;
}

export function CartProvider({
  children,
  initialEntries,
  initialOpen = false,
  routeLocale: rawLocale,
}: CartProviderProps) {
  const routeLocale = rawLocale as RouteLocale;
  const seeded = initialEntries !== undefined;
  const queryClient = useQueryClient();

  const [isOpen, setOpen] = useState(initialOpen);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartError, setCartError] = useState<"itemUnavailable" | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const checkoutPendingRef = useRef(false);
  const mutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const enqueueMutation = useCallback(<T,>(fn: () => Promise<T>): Promise<T> => {
    const next = mutationQueueRef.current.then(fn, fn);
    mutationQueueRef.current = next.catch(() => {});
    return next;
  }, []);

  const initialSnapshot = useMemo(
    () => (seeded ? snapshotFromEntries(routeLocale, initialEntries) : createEmptySnapshot(routeLocale)),
    [initialEntries, routeLocale, seeded],
  );

  const { data: cart = initialSnapshot } = useQuery({
    queryKey: ["cart", routeLocale],
    queryFn: async () => {
      const fetched = await fetchCart(routeLocale);
      setCartError(hasStockWarning(fetched) ? "itemUnavailable" : null);
      return fetched;
    },
    initialData: seeded ? initialSnapshot : undefined,
    staleTime: 60_000,
  });

  const syncCart = useCallback(
    (nextCart: CartSnapshot) => {
      queryClient.setQueryData(["cart", routeLocale], nextCart);
      setCartError(hasStockWarning(nextCart) ? "itemUnavailable" : null);
    },
    [queryClient, routeLocale],
  );

  const onMutationError = useCallback(() => {
    setCartError("itemUnavailable");
    queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] });
  }, [queryClient, routeLocale]);

  const addLineMutation = useMutation({
    mutationFn: (input: { merchandiseId: string; quantity: number; operationId: string }) =>
      addLineRequest({ kind: "caviar", ...input, locale: routeLocale }),
    onSuccess: (res) => syncCart(res.cart),
    onError: onMutationError,
  });

  const addGiftSetMutation = useMutation({
    mutationFn: (input: { merchandiseId: string; quantity: number; unitIds: string[]; operationId: string }) =>
      addLineRequest({ kind: "gift_set", ...input, locale: routeLocale }),
    onSuccess: (res) => syncCart(res.cart),
    onError: onMutationError,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (input: { lineId: string; quantity: number; operationId: string }) =>
      updateQuantityRequest({ ...input, locale: routeLocale }),
    onSuccess: (res) => syncCart(res.cart),
    onError: onMutationError,
  });

  const debouncedUpdateQuantity = useDebounceCallback(
    (input: { lineId: string; quantity: number; operationId: string }) => {
      updateQuantityMutation.mutate(input);
    },
    350,
  );

  const removeLineMutation = useMutation({
    mutationFn: (input: { lineId: string; operationId: string }) =>
      removeLineRequest({ ...input, locale: routeLocale }),
    onSuccess: (res) => syncCart(res.cart),
    onError: () => queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] }),
  });

  const updateGiftMessageMutation = useMutation({
    mutationFn: (input: { lineId: string; giftMessage: CartGiftMessage | null; operationId: string }) =>
      updateGiftMessageRequest({ ...input, locale: routeLocale }),
    onSuccess: (res) => queryClient.setQueryData(["cart", routeLocale], res.cart),
    onError: () => queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] }),
  });

  const isMutating = [
    addLineMutation,
    addGiftSetMutation,
    updateQuantityMutation,
    removeLineMutation,
    updateGiftMessageMutation,
  ].some((m) => m.isPending);

  const addLine = useCallback(
    (input: AddCartLineInput) => {
      if (input.quantity < 1) return Promise.resolve();
      return enqueueMutation(async () => {
        await addLineMutation.mutateAsync({
          merchandiseId: input.merchandiseId,
          quantity: input.quantity,
          operationId: crypto.randomUUID(),
        });
        setOpen(true);
      });
    },
    [addLineMutation, enqueueMutation],
  );

  const addGiftSetUnits = useCallback(
    (input: AddGiftSetInput) => {
      if (input.quantity < 1) return Promise.resolve();
      return enqueueMutation(async () => {
        const count = countGiftUnitsByVariant(cart.entries, input.merchandiseId);
        const available = input.optimistic?.quantityAvailable ?? 99;
        const quantity = Math.min(input.quantity, Math.max(0, available - count));
        if (quantity < 1) return;

        await addGiftSetMutation.mutateAsync({
          merchandiseId: input.merchandiseId,
          quantity,
          unitIds: Array.from({ length: quantity }, () => crypto.randomUUID()),
          operationId: crypto.randomUUID(),
        });
        setOpen(true);
      });
    },
    [addGiftSetMutation, cart.entries, enqueueMutation],
  );

  const setLineQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (quantity < 1) return;
      const line = flattenCartLines(cart.entries).find((c) => c.id === lineId);
      if (!line || line.kind !== "caviar") return;

      const target = Math.min(quantity, line.quantityAvailable ?? 99);
      queryClient.setQueryData<CartSnapshot>(["cart", routeLocale], (old) =>
        old ? applyQuantityLocally(old, lineId, target) : old,
      );

      debouncedUpdateQuantity({ lineId, quantity: target, operationId: crypto.randomUUID() });
    },
    [cart.entries, debouncedUpdateQuantity, queryClient, routeLocale],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!flattenCartLines(cart.entries).some((c) => c.id === lineId)) return;
      debouncedUpdateQuantity.cancel();
      await removeLineMutation.mutateAsync({ lineId, operationId: crypto.randomUUID() });
    },
    [cart.entries, debouncedUpdateQuantity, removeLineMutation],
  );

  const setGiftMessage = useCallback(
    async (lineId: string, giftMessage: CartGiftMessage | null | undefined) => {
      const line = flattenCartLines(cart.entries).find((c) => c.id === lineId);
      if (!line || line.kind !== "gift_set") return;

      await updateGiftMessageMutation.mutateAsync({
        lineId,
        giftMessage: giftMessage ?? null,
        operationId: crypto.randomUUID(),
      });
    },
    [cart.entries, updateGiftMessageMutation],
  );

  const updateRegion = useCallback(
    async (locale: RouteLocale) => {
      const result = await updateRegionRequest(locale);
      if (result.cart) syncCart(result.cart);
    },
    [syncCart],
  );

  const checkout = useCallback(async () => {
    if (typeof window === "undefined" || checkoutPendingRef.current) return;
    debouncedUpdateQuantity.flush();
    checkoutPendingRef.current = true;
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const { checkoutUrl } = await fetchCheckout(routeLocale);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      checkoutPendingRef.current = false;
      setIsCheckingOut(false);
    }
  }, [debouncedUpdateQuantity, routeLocale]);

  const value = useMemo<CartContextValue>(
    () => ({
      addGiftSetUnits,
      addLine,
      checkout,
      close: () => setOpen(false),
      entries: cart.entries,
      isCheckingOut,
      isMutating,
      isOpen,
      itemCount: cart.itemCount,
      open: () => setOpen(true),
      removeLine,
      setGiftMessage,
      setLineQuantity,
      setOpen,
      subtotal: cart.subtotal,
      updateRegion,
      cartError,
      checkoutError,
    }),
    [
      addGiftSetUnits,
      addLine,
      cart.entries,
      cart.itemCount,
      cart.subtotal,
      cartError,
      checkout,
      checkoutError,
      isCheckingOut,
      isMutating,
      isOpen,
      removeLine,
      setGiftMessage,
      setLineQuantity,
      updateRegion,
    ],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a <CartProvider>");
  return context;
}

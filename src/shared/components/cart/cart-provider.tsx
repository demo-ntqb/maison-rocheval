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
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
import { sumMoney } from "@/shared/lib/cart/cart-money";
import type { OptimisticProductData } from "@/shared/lib/cart/cart-operation";
import { getCommerceContextOrDefault } from "@/shared/lib/commerce-context";
import type {
  CartEntry,
  CartGiftMessage,
  CartMoney,
  CartSnapshot,
} from "@/shared/types/cart.type";
import type { RouteLocale } from "@/shared/types/commerce-context.type";

export type AddCartLineInput = {
  merchandiseId: string;
  productId: string;
  quantity: number;
  optimistic: OptimisticProductData;
};

export type AddGiftSetInput = {
  merchandiseId: string;
  productId: string;
  quantity: number;
  group: { addHref?: string; title: string };
  optimistic: OptimisticProductData;
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
};

const CartContext = createContext<CartContextValue | null>(null);

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `operation-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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

function stockWarning(cart: CartSnapshot): boolean {
  return cart.warnings.some((warning) => warning.code.toUpperCase().includes("STOCK"));
}

export interface CartProviderProps {
  children: ReactNode;
  initialEntries?: CartEntry[];
  initialOpen?: boolean;
  routeLocale: string;
}

function CartProviderInner({
  children,
  initialEntries,
  initialOpen = false,
  routeLocale: routeLocaleProp,
}: CartProviderProps) {
  const routeLocale = routeLocaleProp as RouteLocale;
  const seeded = initialEntries !== undefined;
  const queryClient = useQueryClient();

  const [isOpen, setOpen] = useState(initialOpen);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartError, setCartError] = useState<"itemUnavailable" | null>(null);
  const checkoutPendingRef = useRef(false);

  const initialSnapshot = useMemo(
    () =>
      seeded
        ? snapshotFromEntries(routeLocale, initialEntries)
        : createEmptySnapshot(routeLocale),
    [initialEntries, routeLocale, seeded],
  );

  const { data: cart = initialSnapshot } = useQuery({
    queryKey: ["cart", routeLocale],
    queryFn: async () => {
      const fetched = await fetchCart(routeLocale);
      if (stockWarning(fetched)) {
        setCartError("itemUnavailable");
      } else {
        setCartError(null);
      }
      return fetched;
    },
    initialData: seeded ? initialSnapshot : undefined,
    staleTime: 60 * 1000,
  });

  const addLineMutation = useMutation({
    mutationFn: (input: { merchandiseId: string; quantity: number; operationId: string }) =>
      addLineRequest({
        kind: "caviar",
        merchandiseId: input.merchandiseId,
        quantity: input.quantity,
        operationId: input.operationId,
        locale: routeLocale,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(["cart", routeLocale], result.cart);
      setCartError(stockWarning(result.cart) ? "itemUnavailable" : null);
    },
    onError: () => {
      setCartError("itemUnavailable");
      queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] });
    },
  });

  const addGiftSetMutation = useMutation({
    mutationFn: (input: { merchandiseId: string; quantity: number; unitIds: string[]; operationId: string }) =>
      addLineRequest({
        kind: "gift_set",
        merchandiseId: input.merchandiseId,
        quantity: input.quantity,
        unitIds: input.unitIds,
        operationId: input.operationId,
        locale: routeLocale,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(["cart", routeLocale], result.cart);
      setCartError(stockWarning(result.cart) ? "itemUnavailable" : null);
    },
    onError: () => {
      setCartError("itemUnavailable");
      queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (input: { lineId: string; quantity: number; operationId: string }) =>
      updateQuantityRequest({
        lineId: input.lineId,
        quantity: input.quantity,
        operationId: input.operationId,
        locale: routeLocale,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(["cart", routeLocale], result.cart);
      setCartError(stockWarning(result.cart) ? "itemUnavailable" : null);
    },
    onError: () => {
      setCartError("itemUnavailable");
      queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] });
    },
  });

  const removeLineMutation = useMutation({
    mutationFn: (input: { lineId: string; operationId: string }) =>
      removeLineRequest({
        lineId: input.lineId,
        operationId: input.operationId,
        locale: routeLocale,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(["cart", routeLocale], result.cart);
      setCartError(stockWarning(result.cart) ? "itemUnavailable" : null);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] });
    },
  });

  const updateGiftMessageMutation = useMutation({
    mutationFn: (input: { lineId: string; giftMessage: CartGiftMessage | null; operationId: string }) =>
      updateGiftMessageRequest({
        lineId: input.lineId,
        giftMessage: input.giftMessage,
        operationId: input.operationId,
        locale: routeLocale,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(["cart", routeLocale], result.cart);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", routeLocale] });
    },
  });

  const isMutating =
    addLineMutation.isPending ||
    addGiftSetMutation.isPending ||
    updateQuantityMutation.isPending ||
    removeLineMutation.isPending ||
    updateGiftMessageMutation.isPending;

  const addLine = useCallback(
    async (input: AddCartLineInput) => {
      if (input.quantity < 1) return;
      const operationId = createId();
      await addLineMutation.mutateAsync({
        merchandiseId: input.merchandiseId,
        quantity: input.quantity,
        operationId,
      });
      setOpen(true);
    },
    [addLineMutation],
  );

  const addGiftSetUnits = useCallback(
    async (input: AddGiftSetInput) => {
      if (input.quantity < 1) return;
      const existingVariantCount = countGiftUnitsByVariant(cart.entries, input.merchandiseId);
      const available = input.optimistic.quantityAvailable ?? 99;
      const quantity = Math.min(input.quantity, Math.max(0, available - existingVariantCount));
      if (quantity < 1) return;

      const operationId = createId();
      const unitIds = Array.from({ length: quantity }, () => createId());
      await addGiftSetMutation.mutateAsync({
        merchandiseId: input.merchandiseId,
        quantity,
        unitIds,
        operationId,
      });
      setOpen(true);
    },
    [addGiftSetMutation, cart.entries],
  );

  const setLineQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity < 1) return;
      const lines = flattenCartLines(cart.entries);
      const line = lines.find((candidate) => candidate.id === lineId);
      if (!line || line.kind !== "caviar") return;

      const target = Math.min(quantity, line.quantityAvailable ?? 99);
      const operationId = createId();
      await updateQuantityMutation.mutateAsync({
        lineId,
        quantity: target,
        operationId,
      });
    },
    [cart.entries, updateQuantityMutation],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      const lines = flattenCartLines(cart.entries);
      const line = lines.find((candidate) => candidate.id === lineId);
      if (!line) return;

      const operationId = createId();
      await removeLineMutation.mutateAsync({
        lineId,
        operationId,
      });
    },
    [cart.entries, removeLineMutation],
  );

  const setGiftMessage = useCallback(
    async (lineId: string, giftMessage: CartGiftMessage | null | undefined) => {
      const lines = flattenCartLines(cart.entries);
      const line = lines.find((candidate) => candidate.id === lineId);
      if (!line || line.kind !== "gift_set") return;

      const operationId = createId();
      await updateGiftMessageMutation.mutateAsync({
        lineId,
        giftMessage: giftMessage ?? null,
        operationId,
      });
    },
    [cart.entries, updateGiftMessageMutation],
  );

  const updateRegion = useCallback(
    async (locale: RouteLocale) => {
      const result = await updateRegionRequest(locale);
      if (result.cart) {
        queryClient.setQueryData(["cart", locale], result.cart);
        setCartError(stockWarning(result.cart) ? "itemUnavailable" : null);
      }
    },
    [queryClient],
  );

  const checkout = useCallback(async () => {
    if (typeof window === "undefined" || checkoutPendingRef.current) return;
    checkoutPendingRef.current = true;
    setIsCheckingOut(true);

    try {
      const { checkoutUrl } = await fetchCheckout(routeLocale);
      window.location.assign(checkoutUrl);
    } finally {
      checkoutPendingRef.current = false;
      setIsCheckingOut(false);
    }
  }, [routeLocale]);

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
    }),
    [
      addGiftSetUnits,
      addLine,
      cart.entries,
      cart.itemCount,
      cart.subtotal,
      cartError,
      checkout,
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

export function CartProvider(props: CartProviderProps) {
  return <CartProviderInner {...props} />;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a <CartProvider>");
  return context;
}

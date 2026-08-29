"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
import type { OptimisticProductData, PendingCartOperation } from "@/shared/lib/cart/cart-operation";
import { replayCartOperations } from "@/shared/lib/cart/cart-optimistic";
import { isOperationApplied } from "@/shared/lib/cart/cart-reconciliation";
import { getCommerceContextOrDefault } from "@/shared/lib/commerce-context";
import type {
  CartEntry,
  CartGiftMessage,
  CartLine,
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
  addGiftSetUnits: (input: AddGiftSetInput) => void;
  addLine: (input: AddCartLineInput) => void;
  checkout: () => Promise<void>;
  close: () => void;
  entries: CartEntry[];
  isCheckingOut: boolean;
  isOpen: boolean;
  itemCount: number;
  open: () => void;
  removeLine: (lineId: string) => void;
  setGiftMessage: (lineId: string, giftMessage: CartGiftMessage | null | undefined) => void;
  setLineQuantity: (lineId: string, quantity: number) => void;
  setOpen: (open: boolean) => void;
  subtotal: CartMoney;
  updateRegion: (locale: RouteLocale) => Promise<void>;
  cartError: "itemUnavailable" | null;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderState = {
  confirmed: CartSnapshot;
  pending: PendingCartOperation[];
  status: "hydrating" | "ready" | "error";
  cartError: "itemUnavailable" | null;
};

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

function resolveConfirmedLine(
  cart: CartSnapshot,
  reference: { lineId: string; merchandiseId: string; unitId: string | null },
): CartLine | undefined {
  const lines = flattenCartLines(cart.entries);
  return (
    lines.find((line) => line.id === reference.lineId) ??
    (reference.unitId ? lines.find((line) => line.unitId === reference.unitId) : undefined) ??
    lines.find(
      (line) =>
        line.kind === "caviar" &&
        reference.unitId === null &&
        line.merchandiseId === reference.merchandiseId,
    )
  );
}

export interface CartProviderProps {
  children: React.ReactNode;
  initialEntries?: CartEntry[];
  initialOpen?: boolean;
  routeLocale: string;
}

export function CartProvider({
  children,
  initialEntries,
  initialOpen = false,
  routeLocale: routeLocaleProp,
}: CartProviderProps) {
  const routeLocale = routeLocaleProp as RouteLocale;
  const seeded = initialEntries !== undefined;
  const initialConfirmed = seeded
    ? snapshotFromEntries(routeLocale, initialEntries)
    : createEmptySnapshot(routeLocale);

  const [state, setState] = useState<CartProviderState>({
    confirmed: initialConfirmed,
    pending: [],
    status: seeded ? "ready" : "hydrating",
    cartError: null,
  });
  const stateRef = useRef(state);
  const [isOpen, setOpen] = useState(initialOpen);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const checkoutPendingRef = useRef(false);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const updateState = useCallback((updater: (current: CartProviderState) => CartProviderState) => {
    setState((current) => {
      const next = updater(current);
      stateRef.current = next;
      return next;
    });
  }, []);

  const enqueue = useCallback((task: () => Promise<void>): Promise<void> => {
    const next = queueRef.current.then(task, task);
    queueRef.current = next.catch(() => undefined);
    return next;
  }, []);

  useEffect(() => {
    if (seeded) return;
    let cancelled = false;

    void fetchCart(routeLocale)
      .then((cart) => {
        if (cancelled) return;
        updateState((current) => ({
          ...current,
          confirmed: cart,
          status: "ready",
          cartError: stockWarning(cart) ? "itemUnavailable" : null,
        }));
      })
      .catch(() => {
        if (cancelled) return;
        updateState((current) => ({ ...current, status: "error" }));
      });

    return () => {
      cancelled = true;
    };
  }, [routeLocale, seeded, updateState]);

  const visibleCart = useMemo(
    () => replayCartOperations(state.confirmed, state.pending),
    [state.confirmed, state.pending],
  );

  const addPending = useCallback(
    (operation: PendingCartOperation) => {
      updateState((current) => ({ ...current, pending: [...current.pending, operation] }));
    },
    [updateState],
  );

  const commitOperation = useCallback(
    (operationId: string, cart: CartSnapshot) => {
      updateState((current) => ({
        ...current,
        confirmed: cart,
        pending: current.pending.filter((operation) => operation.id !== operationId),
        status: "ready",
        cartError: stockWarning(cart) ? "itemUnavailable" : null,
      }));
    },
    [updateState],
  );

  const reconcileAfterFailure = useCallback(
    async (operationId: string) => {
      const operation = stateRef.current.pending.find((candidate) => candidate.id === operationId);
      try {
        const cart = await fetchCart(routeLocale);
        const applied = operation ? isOperationApplied(operation, cart) : false;
        updateState((current) => ({
          ...current,
          confirmed: cart,
          pending: current.pending.filter((candidate) => candidate.id !== operationId),
          status: applied ? "ready" : "error",
          cartError: stockWarning(cart) ? "itemUnavailable" : null,
        }));
      } catch {
        updateState((current) => ({
          ...current,
          pending: current.pending.filter((operation) => operation.id !== operationId),
          status: "error",
        }));
      }
    },
    [routeLocale, updateState],
  );

  const addLine = useCallback(
    (input: AddCartLineInput) => {
      if (input.quantity < 1) return;

      const currentLine = flattenCartLines(visibleCart.entries).find(
        (line) => line.kind === "caviar" && line.merchandiseId === input.merchandiseId,
      );
      const max = input.optimistic.quantityAvailable ?? currentLine?.quantityAvailable ?? 99;
      const targetQuantity = Math.min((currentLine?.quantity ?? 0) + input.quantity, max);
      const operationId = createId();
      const operation: PendingCartOperation = {
        id: operationId,
        type: "add_caviar",
        createdAt: Date.now(),
        merchandiseId: input.merchandiseId,
        productId: input.productId,
        quantity: input.quantity,
        targetQuantity,
        optimistic: input.optimistic,
      };

      addPending(operation);
      setOpen(true);

      void enqueue(async () => {
        try {
          const result = await addLineRequest({
            kind: "caviar",
            merchandiseId: input.merchandiseId,
            quantity: input.quantity,
            operationId,
            locale: routeLocale,
          });
          commitOperation(operationId, result.cart);
        } catch {
          await reconcileAfterFailure(operationId);
        }
      });
    },
    [
      addPending,
      commitOperation,
      enqueue,
      reconcileAfterFailure,
      routeLocale,
      visibleCart.entries,
    ],
  );

  const addGiftSetUnits = useCallback(
    (input: AddGiftSetInput) => {
      if (input.quantity < 1) return;
      const existingVariantCount = countGiftUnitsByVariant(visibleCart.entries, input.merchandiseId);
      const available = input.optimistic.quantityAvailable ?? 99;
      const quantity = Math.min(input.quantity, Math.max(0, available - existingVariantCount));
      if (quantity < 1) return;

      const operationId = createId();
      const unitIds = Array.from({ length: quantity }, () => createId());
      const operation: PendingCartOperation = {
        id: operationId,
        type: "add_gift",
        createdAt: Date.now(),
        merchandiseId: input.merchandiseId,
        productId: input.productId,
        units: unitIds.map((unitId) => ({ unitId })),
        group: input.group,
        optimistic: input.optimistic,
      };

      addPending(operation);
      setOpen(true);

      void enqueue(async () => {
        try {
          const result = await addLineRequest({
            kind: "gift_set",
            merchandiseId: input.merchandiseId,
            quantity,
            unitIds,
            operationId,
            locale: routeLocale,
          });
          commitOperation(operationId, result.cart);
        } catch {
          await reconcileAfterFailure(operationId);
        }
      });
    },
    [addPending, commitOperation, enqueue, reconcileAfterFailure, routeLocale, visibleCart.entries],
  );

  const setLineQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (quantity < 1) return;
      const line = flattenCartLines(visibleCart.entries).find((candidate) => candidate.id === lineId);
      if (!line || line.kind !== "caviar") return;

      const target = Math.min(quantity, line.quantityAvailable ?? 99);
      const operationId = createId();
      const operation: PendingCartOperation = {
        id: operationId,
        type: "set_quantity",
        createdAt: Date.now(),
        lineId,
        merchandiseId: line.merchandiseId,
        quantity: target,
      };
      addPending(operation);

      void enqueue(async () => {
        const confirmedLine = resolveConfirmedLine(stateRef.current.confirmed, {
          lineId,
          merchandiseId: line.merchandiseId,
          unitId: null,
        });
        if (!confirmedLine) {
          await reconcileAfterFailure(operationId);
          return;
        }
        try {
          const result = await updateQuantityRequest({
            lineId: confirmedLine.id,
            quantity: target,
            operationId,
            locale: routeLocale,
          });
          commitOperation(operationId, result.cart);
        } catch {
          await reconcileAfterFailure(operationId);
        }
      });
    },
    [addPending, commitOperation, enqueue, reconcileAfterFailure, routeLocale, visibleCart.entries],
  );

  const removeLine = useCallback(
    (lineId: string) => {
      const line = flattenCartLines(visibleCart.entries).find((candidate) => candidate.id === lineId);
      if (!line) return;
      const operationId = createId();
      const operation: PendingCartOperation = {
        id: operationId,
        type: "remove",
        createdAt: Date.now(),
        lineId,
        merchandiseId: line.merchandiseId,
        unitId: line.unitId,
      };
      addPending(operation);

      void enqueue(async () => {
        const confirmedLine = resolveConfirmedLine(stateRef.current.confirmed, operation);
        if (!confirmedLine) {
          updateState((current) => ({
            ...current,
            pending: current.pending.filter((candidate) => candidate.id !== operationId),
          }));
          return;
        }
        try {
          const result = await removeLineRequest({
            lineId: confirmedLine.id,
            operationId,
            locale: routeLocale,
          });
          commitOperation(operationId, result.cart);
        } catch {
          await reconcileAfterFailure(operationId);
        }
      });
    },
    [addPending, commitOperation, enqueue, reconcileAfterFailure, routeLocale, updateState, visibleCart.entries],
  );

  const setGiftMessage = useCallback(
    (lineId: string, giftMessage: CartGiftMessage | null | undefined) => {
      const line = flattenCartLines(visibleCart.entries).find((candidate) => candidate.id === lineId);
      if (!line || line.kind !== "gift_set") return;
      const operationId = createId();
      const operation: PendingCartOperation = {
        id: operationId,
        type: "gift_message",
        createdAt: Date.now(),
        lineId,
        merchandiseId: line.merchandiseId,
        unitId: line.unitId,
        giftMessage: giftMessage ?? null,
      };
      addPending(operation);

      void enqueue(async () => {
        const confirmedLine = resolveConfirmedLine(stateRef.current.confirmed, operation);
        if (!confirmedLine) {
          await reconcileAfterFailure(operationId);
          return;
        }
        try {
          const result = await updateGiftMessageRequest({
            lineId: confirmedLine.id,
            giftMessage: giftMessage ?? null,
            operationId,
            locale: routeLocale,
          });
          commitOperation(operationId, result.cart);
        } catch {
          await reconcileAfterFailure(operationId);
        }
      });
    },
    [addPending, commitOperation, enqueue, reconcileAfterFailure, routeLocale, visibleCart.entries],
  );

  const updateRegion = useCallback(
    async (locale: RouteLocale) => {
      await enqueue(async () => {
        const result = await updateRegionRequest(locale);
        if (result.cart) {
          updateState((current) => ({
            ...current,
            confirmed: result.cart as CartSnapshot,
            cartError: stockWarning(result.cart as CartSnapshot) ? "itemUnavailable" : null,
          }));
        }
      });
    },
    [enqueue, updateState],
  );

  const checkout = useCallback(async () => {
    if (typeof window === "undefined" || checkoutPendingRef.current) return;
    checkoutPendingRef.current = true;
    setIsCheckingOut(true);

    try {
      await queueRef.current;
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
      entries: visibleCart.entries,
      isCheckingOut,
      isOpen,
      itemCount: visibleCart.itemCount,
      open: () => setOpen(true),
      removeLine,
      setGiftMessage,
      setLineQuantity,
      setOpen,
      subtotal: visibleCart.subtotal,
      updateRegion,
      cartError: state.cartError,
    }),
    [
      addGiftSetUnits,
      addLine,
      checkout,
      isCheckingOut,
      isOpen,
      removeLine,
      setGiftMessage,
      setLineQuantity,
      state.cartError,
      updateRegion,
      visibleCart.entries,
      visibleCart.itemCount,
      visibleCart.subtotal,
    ],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a <CartProvider>");
  return context;
}

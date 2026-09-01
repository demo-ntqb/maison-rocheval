"use client";

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addLine as addLineRequest,
  CartClientError,
  type CartMutationResponse,
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

export type CartUiError =
  | "itemUnavailable"
  | "mutationFailed"
  | "checkoutFailed"
  | "serviceUnavailable"
  | null;

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
  cartError: CartUiError;
};

type CartMutationTask = {
  operationId: string;
  request: () => Promise<CartMutationResponse>;
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

function mutationUiError(error: unknown): Exclude<CartUiError, null | "checkoutFailed"> {
  if (error instanceof CartClientError) {
    if (error.code === "OUT_OF_STOCK") return "itemUnavailable";
    if (error.code === "UPSTREAM_UNAVAILABLE") return "serviceUnavailable";
  }
  return "mutationFailed";
}

function checkoutUiError(error: unknown): "checkoutFailed" | "serviceUnavailable" {
  return error instanceof CartClientError && error.code === "UPSTREAM_UNAVAILABLE"
    ? "serviceUnavailable"
    : "checkoutFailed";
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

function CartProviderContent({
  children,
  initialEntries,
  initialOpen = false,
  routeLocale: routeLocaleProp,
}: CartProviderProps) {
  const routeLocale = routeLocaleProp as RouteLocale;
  const queryClient = useQueryClient();
  const seeded = initialEntries !== undefined;
  const emptyCart = useMemo(() => createEmptySnapshot(routeLocale), [routeLocale]);
  const initialCart = useMemo(
    () => (seeded ? snapshotFromEntries(routeLocale, initialEntries ?? []) : undefined),
    [initialEntries, routeLocale, seeded],
  );
  const cartQueryKey = useMemo(() => ["cart", routeLocale] as const, [routeLocale]);

  const cartQuery = useQuery<CartSnapshot>({
    queryKey: cartQueryKey,
    queryFn: () => fetchCart(routeLocale),
    initialData: initialCart,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [pendingOperations, setPendingOperations] = useState<PendingCartOperation[]>([]);
  const pendingOperationsRef = useRef<PendingCartOperation[]>([]);
  const [cartError, setCartError] = useState<CartUiError>(null);
  const [isOpen, setOpen] = useState(initialOpen);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const checkoutPendingRef = useRef(false);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const addPendingOperation = useCallback((operation: PendingCartOperation) => {
    const next = [...pendingOperationsRef.current, operation];
    pendingOperationsRef.current = next;
    setPendingOperations(next);
  }, []);

  const removePendingOperation = useCallback((operationId: string) => {
    const next = pendingOperationsRef.current.filter((operation) => operation.id !== operationId);
    pendingOperationsRef.current = next;
    setPendingOperations(next);
  }, []);

  const enqueue = useCallback((task: () => Promise<void>): Promise<void> => {
    const next = queueRef.current.then(task, task);
    queueRef.current = next.catch(() => undefined);
    return next;
  }, []);

  const publishConfirmedCart = useCallback(
    (cart: CartSnapshot) => {
      queryClient.setQueryData<CartSnapshot>(cartQueryKey, cart);
      setCartError(stockWarning(cart) ? "itemUnavailable" : null);
    },
    [cartQueryKey, queryClient],
  );

  const reconcileAfterFailure = useCallback(
    async (operationId: string, failure: unknown) => {
      const operation = pendingOperationsRef.current.find(
        (candidate) => candidate.id === operationId,
      );

      try {
        await queryClient.cancelQueries({ queryKey: cartQueryKey, exact: true });
        await queryClient.invalidateQueries({
          queryKey: cartQueryKey,
          exact: true,
          refetchType: "none",
        });
        const cart = await queryClient.fetchQuery<CartSnapshot>({
          queryKey: cartQueryKey,
          queryFn: () => fetchCart(routeLocale),
          retry: false,
          staleTime: Infinity,
        });
        const applied = operation ? isOperationApplied(operation, cart) : false;

        removePendingOperation(operationId);
        setCartError(
          stockWarning(cart) ? "itemUnavailable" : applied ? null : mutationUiError(failure),
        );
      } catch {
        removePendingOperation(operationId);
        setCartError("serviceUnavailable");
      }
    },
    [cartQueryKey, queryClient, removePendingOperation, routeLocale],
  );

  const { mutateAsync: mutateCart } = useMutation<
    CartMutationResponse,
    unknown,
    CartMutationTask
  >({
    mutationFn: ({ request }) => request(),
    retry: false,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey, exact: true });
    },
    onSuccess: (result, task) => {
      queryClient.setQueryData<CartSnapshot>(cartQueryKey, result.cart);
      removePendingOperation(task.operationId);
      setCartError(stockWarning(result.cart) ? "itemUnavailable" : null);
    },
    onError: async (error, task) => {
      await reconcileAfterFailure(task.operationId, error);
    },
  });

  const runMutation = useCallback(
    async (task: CartMutationTask) => {
      try {
        await mutateCart(task);
      } catch {
        // onError owns reconciliation and UI error state. Keep the queue fulfilled
        // so the next explicit cart operation can run in order.
      }
    },
    [mutateCart],
  );

  const confirmedCart = cartQuery.data ?? emptyCart;
  const resolvedCartError: CartUiError =
    cartError ??
    (stockWarning(confirmedCart)
      ? "itemUnavailable"
      : cartQuery.isError && cartQuery.data === undefined && pendingOperations.length === 0
        ? "serviceUnavailable"
        : null);
  const visibleCart = useMemo(
    () => replayCartOperations(confirmedCart, pendingOperations),
    [confirmedCart, pendingOperations],
  );

  const getConfirmedCart = useCallback(
    () => queryClient.getQueryData<CartSnapshot>(cartQueryKey) ?? emptyCart,
    [cartQueryKey, emptyCart, queryClient],
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

      addPendingOperation(operation);
      setOpen(true);

      void enqueue(() =>
        runMutation({
          operationId,
          request: () =>
            addLineRequest({
              merchandiseId: input.merchandiseId,
              quantity: input.quantity,
              operationId,
              locale: routeLocale,
            }),
        }),
      );
    },
    [addPendingOperation, enqueue, routeLocale, runMutation, visibleCart.entries],
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

      addPendingOperation(operation);
      setOpen(true);

      void enqueue(() =>
        runMutation({
          operationId,
          request: () =>
            addLineRequest({
              merchandiseId: input.merchandiseId,
              quantity,
              unitIds,
              operationId,
              locale: routeLocale,
            }),
        }),
      );
    },
    [addPendingOperation, enqueue, routeLocale, runMutation, visibleCart.entries],
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
      addPendingOperation(operation);

      void enqueue(async () => {
        const confirmedLine = resolveConfirmedLine(getConfirmedCart(), {
          lineId,
          merchandiseId: line.merchandiseId,
          unitId: null,
        });
        if (!confirmedLine) {
          await reconcileAfterFailure(operationId, new Error("Confirmed cart line is unavailable"));
          return;
        }

        await runMutation({
          operationId,
          request: () =>
            updateQuantityRequest({
              lineId: confirmedLine.id,
              quantity: target,
              operationId,
              locale: routeLocale,
            }),
        });
      });
    },
    [
      addPendingOperation,
      enqueue,
      getConfirmedCart,
      reconcileAfterFailure,
      routeLocale,
      runMutation,
      visibleCart.entries,
    ],
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
      addPendingOperation(operation);

      void enqueue(async () => {
        const confirmedLine = resolveConfirmedLine(getConfirmedCart(), operation);
        if (!confirmedLine) {
          removePendingOperation(operationId);
          return;
        }

        await runMutation({
          operationId,
          request: () =>
            removeLineRequest({
              lineId: confirmedLine.id,
              operationId,
              locale: routeLocale,
            }),
        });
      });
    },
    [
      addPendingOperation,
      enqueue,
      getConfirmedCart,
      removePendingOperation,
      routeLocale,
      runMutation,
      visibleCart.entries,
    ],
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
      addPendingOperation(operation);

      void enqueue(async () => {
        const confirmedLine = resolveConfirmedLine(getConfirmedCart(), operation);
        if (!confirmedLine) {
          await reconcileAfterFailure(
            operationId,
            new Error("Confirmed gift-set unit is unavailable"),
          );
          return;
        }

        await runMutation({
          operationId,
          request: () =>
            updateGiftMessageRequest({
              lineId: confirmedLine.id,
              giftMessage: giftMessage ?? null,
              operationId,
              locale: routeLocale,
            }),
        });
      });
    },
    [
      addPendingOperation,
      enqueue,
      getConfirmedCart,
      reconcileAfterFailure,
      routeLocale,
      runMutation,
      visibleCart.entries,
    ],
  );

  const updateRegion = useCallback(
    async (locale: RouteLocale) => {
      await enqueue(async () => {
        await queryClient.cancelQueries({ queryKey: cartQueryKey, exact: true });
        const result = await updateRegionRequest(locale);
        if (result.cart) publishConfirmedCart(result.cart as CartSnapshot);
      });
    },
    [cartQueryKey, enqueue, publishConfirmedCart, queryClient],
  );

  const checkout = useCallback(async () => {
    if (typeof window === "undefined" || checkoutPendingRef.current) return;
    checkoutPendingRef.current = true;
    setIsCheckingOut(true);
    setCartError((current) =>
      current === "checkoutFailed" || current === "serviceUnavailable" ? null : current,
    );

    try {
      await queueRef.current;
      const { checkoutUrl } = await fetchCheckout(routeLocale);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setCartError(checkoutUiError(error));
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
      cartError: resolvedCartError,
    }),
    [
      addGiftSetUnits,
      addLine,
      checkout,
      isCheckingOut,
      isOpen,
      removeLine,
      resolvedCartError,
      setGiftMessage,
      setLineQuantity,
      updateRegion,
      visibleCart.entries,
      visibleCart.itemCount,
      visibleCart.subtotal,
    ],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function CartProvider(props: CartProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProviderContent {...props} />
    </QueryClientProvider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a <CartProvider>");
  return context;
}

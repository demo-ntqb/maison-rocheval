import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartEntry, CartSnapshot } from "@/shared/types/cart.type";

const cartApi = vi.hoisted(() => ({
  addLine: vi.fn(),
  fetchCart: vi.fn(),
  fetchCheckout: vi.fn(),
  removeLine: vi.fn(),
  updateGiftMessage: vi.fn(),
  updateQuantity: vi.fn(),
  updateRegion: vi.fn(),
}));

vi.mock("@/shared/lib/cart/cart-api", () => ({
  ...cartApi,
  CartClientError: class CartClientError extends Error {
    constructor(
      public readonly code: string,
      message: string,
      public readonly retryable: boolean,
    ) {
      super(message);
    }
  },
}));

import { CartProvider, useCart } from "./cart-provider";

const IMAGE = { altText: "Amour", height: 500, url: "/images/caviar/amour.png", width: 500 };
const EMPTY: CartSnapshot = {
  entries: [],
  itemCount: 0,
  subtotal: { amount: "0.00", currencyCode: "SGD" },
  countryCode: "SG",
  warnings: [],
};

function caviarSnapshot(quantity: number): CartSnapshot {
  return {
    ...EMPTY,
    itemCount: quantity,
    subtotal: { amount: `${75 * quantity}.00`, currencyCode: "SGD" },
    entries: [
      {
        kind: "line",
        line: {
          id: "gid://shopify/CartLine/caviar",
          merchandiseId: "gid://shopify/ProductVariant/amour-30",
          productId: "gid://shopify/Product/amour",
          kind: "caviar",
          image: IMAGE,
          quantity,
          quantityAvailable: 10,
          quantityEditable: true,
          supportsGiftMessage: false,
          title: "Amour",
          weight: "30g",
          unitPrice: { amount: "75.00", currencyCode: "SGD" },
          subtotal: { amount: `${75 * quantity}.00`, currencyCode: "SGD" },
          giftMessage: null,
          unitId: null,
        },
      },
    ],
  };
}

function giftSnapshot(unitIds: string[]): CartSnapshot {
  return {
    ...EMPTY,
    itemCount: unitIds.length,
    subtotal: { amount: `${100 * unitIds.length}.00`, currencyCode: "SGD" },
    entries: [
      {
        kind: "group",
        group: {
          id: "gid://shopify/Product/gift",
          title: "L'Initiation",
          lines: unitIds.map((unitId, index) => ({
            id: `gid://shopify/CartLine/gift-${index}`,
            merchandiseId: "gid://shopify/ProductVariant/gift-30",
            productId: "gid://shopify/Product/gift",
            kind: "gift_set" as const,
            image: IMAGE,
            quantity: 1,
            quantityAvailable: 10,
            quantityEditable: false,
            supportsGiftMessage: true,
            title: "L'Initiation",
            weight: "Three 30g Tins",
            unitPrice: { amount: "100.00", currencyCode: "SGD" },
            subtotal: { amount: "100.00", currencyCode: "SGD" },
            giftMessage: null,
            unitId,
          })),
        },
      },
    ],
  };
}

function Probe() {
  const cart = useCart();
  const confirmed = useQuery<CartSnapshot>({
    queryKey: ["cart", "en-sg"],
    queryFn: async () => EMPTY,
    enabled: false,
  });
  const firstLine = cart.entries.flatMap((entry) =>
    entry.kind === "line" ? [entry.line] : entry.group.lines,
  )[0];

  return (
    <div>
      <p data-testid="is-open">{String(cart.isOpen)}</p>
      <p data-testid="item-count">{cart.itemCount}</p>
      <p data-testid="confirmed-item-count">{confirmed.data?.itemCount ?? "none"}</p>
      <p data-testid="total">{cart.subtotal.amount}</p>
      <p data-testid="cart-error">{cart.cartError ?? "none"}</p>
      <ul data-testid="entries">
        {cart.entries.map((entry) =>
          entry.kind === "line" ? (
            <li key={entry.line.id}>line:{entry.line.title}:{entry.line.quantity}</li>
          ) : (
            <li key={entry.group.id}>group:{entry.group.title}:{entry.group.lines.length}</li>
          ),
        )}
      </ul>
      <button
        type="button"
        onClick={() =>
          cart.addLine({
            merchandiseId: "gid://shopify/ProductVariant/amour-30",
            productId: "gid://shopify/Product/amour",
            quantity: 1,
            optimistic: {
              image: IMAGE,
              title: "Amour",
              unitPrice: { amount: "75.00", currencyCode: "SGD" },
              weight: "30g",
              quantityAvailable: 10,
            },
          })
        }
      >
        add caviar
      </button>
      <button
        type="button"
        onClick={() =>
          cart.addGiftSetUnits({
            merchandiseId: "gid://shopify/ProductVariant/gift-30",
            productId: "gid://shopify/Product/gift",
            quantity: 2,
            group: { addHref: "/products/gift-set/linitiation", title: "L'Initiation" },
            optimistic: {
              image: IMAGE,
              title: "L'Initiation",
              unitPrice: { amount: "100.00", currencyCode: "SGD" },
              weight: "Three 30g Tins",
              quantityAvailable: 10,
            },
          })
        }
      >
        add gift set
      </button>
      <button
        type="button"
        onClick={() => {
          if (firstLine) cart.setLineQuantity(firstLine.id, 2);
        }}
      >
        set quantity
      </button>
      <button
        type="button"
        onClick={() => {
          if (firstLine) cart.removeLine(firstLine.id);
        }}
      >
        remove line
      </button>
      <button type="button" onClick={() => void cart.checkout()}>checkout</button>
    </div>
  );
}

function renderProbe(initialEntries: CartEntry[] = []) {
  return render(
    <CartProvider initialEntries={initialEntries} routeLocale="en-sg">
      <Probe />
    </CartProvider>,
  );
}

function renderUnseededProbe() {
  return render(
    <CartProvider routeLocale="en-sg">
      <Probe />
    </CartProvider>,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((complete, fail) => {
    resolve = complete;
    reject = fail;
  });
  return { promise, reject, resolve };
}

describe("CartProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cartApi.addLine.mockImplementation(async (input: { quantity: number; unitIds?: string[] }) => ({
      operationId: "server-operation",
      cart: input.unitIds ? giftSnapshot(input.unitIds) : caviarSnapshot(input.quantity),
      warnings: [],
    }));
    cartApi.fetchCart.mockResolvedValue(EMPTY);
    cartApi.fetchCheckout.mockResolvedValue({ checkoutUrl: "https://example.test/checkouts/current" });
    cartApi.removeLine.mockResolvedValue({ operationId: "remove-operation", cart: EMPTY, warnings: [] });
    cartApi.updateQuantity.mockImplementation(async (input: { quantity: number }) => ({
      operationId: "quantity-operation",
      cart: caviarSnapshot(input.quantity),
      warnings: [],
    }));
  });

  it("opens the drawer and renders caviar optimistically before Shopify confirms", () => {
    cartApi.addLine.mockReturnValue(new Promise(() => undefined));
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));

    expect(screen.getByTestId("is-open").textContent).toBe("true");
    expect(screen.getByTestId("item-count").textContent).toBe("1");
    expect(screen.getByText("line:Amour:1")).toBeInTheDocument();
  });

  it("keeps the Shopify-confirmed snapshot only in query cache while optimistic intent stays pending", async () => {
    const add = deferred<{ operationId: string; cart: CartSnapshot; warnings: [] }>();
    cartApi.addLine.mockReturnValue(add.promise);
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));

    expect(screen.getByTestId("item-count").textContent).toBe("1");
    expect(screen.getByTestId("confirmed-item-count").textContent).toBe("0");

    await waitFor(() => expect(cartApi.addLine).toHaveBeenCalledTimes(1));
    await act(async () => {
      add.resolve({ operationId: "server-operation", cart: caviarSnapshot(1), warnings: [] });
      await add.promise;
    });

    await waitFor(() => expect(screen.getByTestId("confirmed-item-count").textContent).toBe("1"));
    expect(screen.getByTestId("item-count").textContent).toBe("1");
  });

  it("merges repeated caviar intent by merchandiseId in the optimistic view", () => {
    cartApi.addLine.mockReturnValue(new Promise(() => undefined));
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));
    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));

    expect(screen.getByTestId("entries").children).toHaveLength(1);
    expect(screen.getByText("line:Amour:2")).toBeInTheDocument();
  });

  it("creates one optimistic row per physical gift unit", () => {
    cartApi.addLine.mockReturnValue(new Promise(() => undefined));
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "add gift set" }));

    expect(screen.getByText("group:L'Initiation:2")).toBeInTheDocument();
    expect(screen.getByTestId("item-count").textContent).toBe("2");
  });

  it("sends only cart intent fields and never browser commerce kind", async () => {
    renderProbe();
    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(cartApi.addLine).toHaveBeenCalledWith(
      expect.objectContaining({
        merchandiseId: "gid://shopify/ProductVariant/amour-30",
        quantity: 1,
        locale: "en-sg",
        operationId: expect.any(String),
      }),
    );
    expect(cartApi.addLine.mock.calls[0]?.[0]).not.toHaveProperty("kind");
    expect(cartApi.addLine.mock.calls[0]?.[0]).not.toHaveProperty("price");
    expect(cartApi.addLine.mock.calls[0]?.[0]).not.toHaveProperty("image");
    expect(cartApi.addLine.mock.calls[0]?.[0]).not.toHaveProperty("productId");
  });

  it("does not let a stale hydration response overwrite a completed mutation", async () => {
    const hydration = deferred<CartSnapshot>();
    cartApi.fetchCart.mockReturnValue(hydration.promise);
    renderUnseededProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));
    await waitFor(() => expect(cartApi.addLine).toHaveBeenCalledTimes(1));
    expect(screen.getByText("line:Amour:1")).toBeInTheDocument();

    await act(async () => {
      hydration.resolve(EMPTY);
      await hydration.promise;
    });

    expect(screen.getByText("line:Amour:1")).toBeInTheDocument();
    expect(screen.getByTestId("confirmed-item-count").textContent).toBe("1");
  });

  it("does not let a stale hydration rejection overwrite a completed mutation", async () => {
    const hydration = deferred<CartSnapshot>();
    cartApi.fetchCart.mockReturnValue(hydration.promise);
    renderUnseededProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));
    await waitFor(() => expect(cartApi.addLine).toHaveBeenCalledTimes(1));
    expect(screen.getByText("line:Amour:1")).toBeInTheDocument();

    await act(async () => {
      hydration.reject(new Error("stale hydration failed"));
      await hydration.promise.catch(() => undefined);
    });

    expect(screen.getByTestId("cart-error").textContent).toBe("none");
    expect(screen.getByText("line:Amour:1")).toBeInTheDocument();
  });

  it("waits for queued mutations and coalesces double-clicked checkout", async () => {
    const add = deferred<{ operationId: string; cart: CartSnapshot; warnings: [] }>();
    const checkout = deferred<{ checkoutUrl: string }>();
    cartApi.addLine.mockReturnValue(add.promise);
    cartApi.fetchCheckout.mockReturnValue(checkout.promise);
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));
    fireEvent.click(screen.getByRole("button", { name: "checkout" }));
    fireEvent.click(screen.getByRole("button", { name: "checkout" }));
    expect(cartApi.fetchCheckout).not.toHaveBeenCalled();

    await act(async () => {
      add.resolve({ operationId: "server-operation", cart: caviarSnapshot(1), warnings: [] });
      await add.promise;
    });

    await waitFor(() => expect(cartApi.fetchCheckout).toHaveBeenCalledTimes(1));
  });

  it("keeps update and remove writes serialized against the latest confirmed cache", async () => {
    const update = deferred<{ operationId: string; cart: CartSnapshot; warnings: [] }>();
    cartApi.updateQuantity.mockReturnValue(update.promise);
    renderProbe(caviarSnapshot(1).entries);

    fireEvent.click(screen.getByRole("button", { name: "set quantity" }));
    fireEvent.click(screen.getByRole("button", { name: "remove line" }));

    await waitFor(() => expect(cartApi.updateQuantity).toHaveBeenCalledTimes(1));
    expect(cartApi.removeLine).not.toHaveBeenCalled();

    await act(async () => {
      update.resolve({ operationId: "quantity-operation", cart: caviarSnapshot(2), warnings: [] });
      await update.promise;
    });

    await waitFor(() => expect(cartApi.removeLine).toHaveBeenCalledTimes(1));
    expect(cartApi.removeLine).toHaveBeenCalledWith(
      expect.objectContaining({
        lineId: "gid://shopify/CartLine/caviar",
        locale: "en-sg",
      }),
    );
  });

  it("shows mutationFailed after reconciliation proves an optimistic mutation was not applied", async () => {
    cartApi.addLine.mockRejectedValueOnce(new Error("network failed"));
    cartApi.fetchCart.mockResolvedValue(EMPTY);
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));

    await waitFor(() => expect(screen.getByTestId("cart-error").textContent).toBe("mutationFailed"));
    expect(screen.getByTestId("item-count").textContent).toBe("0");
    expect(cartApi.fetchCart).toHaveBeenCalledTimes(1);
    expect(cartApi.addLine).toHaveBeenCalledTimes(1);
  });

  it("accepts the reconciled Shopify snapshot when a failed response was already applied upstream", async () => {
    cartApi.addLine.mockRejectedValueOnce(new Error("connection dropped after write"));
    cartApi.fetchCart.mockResolvedValue(caviarSnapshot(1));
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "add caviar" }));

    await waitFor(() => expect(cartApi.fetchCart).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId("confirmed-item-count").textContent).toBe("1"));
    expect(screen.getByTestId("item-count").textContent).toBe("1");
    expect(screen.getByTestId("cart-error").textContent).toBe("none");
    expect(cartApi.addLine).toHaveBeenCalledTimes(1);
  });

  it("shows checkoutFailed and allows the buyer to retry when checkout fails", async () => {
    const retryCheckout = new Promise<{ checkoutUrl: string }>(() => undefined);
    cartApi.fetchCheckout
      .mockRejectedValueOnce(new Error("checkout failed"))
      .mockReturnValueOnce(retryCheckout);
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "checkout" }));
    await waitFor(() => expect(screen.getByTestId("cart-error").textContent).toBe("checkoutFailed"));

    fireEvent.click(screen.getByRole("button", { name: "checkout" }));
    await waitFor(() => expect(cartApi.fetchCheckout).toHaveBeenCalledTimes(2));
  });
});

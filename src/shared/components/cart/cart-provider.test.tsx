import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartSnapshot } from "@/shared/types/cart.type";

const cartApi = vi.hoisted(() => ({
  addLine: vi.fn(),
  fetchCart: vi.fn(),
  fetchCheckout: vi.fn(),
  removeLine: vi.fn(),
  updateGiftMessage: vi.fn(),
  updateQuantity: vi.fn(),
  updateRegion: vi.fn(),
}));

vi.mock("@/shared/lib/cart/cart-api", () => cartApi);

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
  return (
    <div>
      <p data-testid="is-open">{String(cart.isOpen)}</p>
      <p data-testid="item-count">{cart.itemCount}</p>
      <p data-testid="total">{cart.subtotal.amount}</p>
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
      <button type="button" onClick={() => void cart.checkout()}>checkout</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <CartProvider initialEntries={[]} routeLocale="en-sg">
      <Probe />
    </CartProvider>,
  );
}

describe("CartProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cartApi.addLine.mockImplementation(async (input: { kind: string; quantity: number; unitIds?: string[] }) => ({
      operationId: "server-operation",
      cart: input.kind === "gift_set" ? giftSnapshot(input.unitIds ?? []) : caviarSnapshot(input.quantity),
      warnings: [],
    }));
    cartApi.fetchCheckout.mockResolvedValue({ checkoutUrl: "https://example.test/checkouts/current" });
  });

  it("opens the drawer and renders caviar optimistically before Shopify confirms", () => {
    cartApi.addLine.mockReturnValue(new Promise(() => undefined));
    renderProbe();

    screen.getByRole("button", { name: "add caviar" }).click();

    expect(screen.getByTestId("is-open").textContent).toBe("true");
    expect(screen.getByTestId("item-count").textContent).toBe("1");
    expect(screen.getByText("line:Amour:1")).toBeInTheDocument();
  });

  it("merges repeated caviar intent by merchandiseId in the optimistic view", () => {
    cartApi.addLine.mockReturnValue(new Promise(() => undefined));
    renderProbe();

    screen.getByRole("button", { name: "add caviar" }).click();
    screen.getByRole("button", { name: "add caviar" }).click();

    expect(screen.getByTestId("entries").children).toHaveLength(1);
    expect(screen.getByText("line:Amour:2")).toBeInTheDocument();
  });

  it("creates one optimistic row per physical gift unit", () => {
    cartApi.addLine.mockReturnValue(new Promise(() => undefined));
    renderProbe();

    screen.getByRole("button", { name: "add gift set" }).click();

    expect(screen.getByText("group:L'Initiation:2")).toBeInTheDocument();
    expect(screen.getByTestId("item-count").textContent).toBe("2");
  });

  it("sends only cart intent fields to the add API", async () => {
    renderProbe();
    screen.getByRole("button", { name: "add caviar" }).click();

    await act(async () => {
      await Promise.resolve();
    });

    expect(cartApi.addLine).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "caviar",
        merchandiseId: "gid://shopify/ProductVariant/amour-30",
        quantity: 1,
        locale: "en-sg",
        operationId: expect.any(String),
      }),
    );
    expect(cartApi.addLine.mock.calls[0]?.[0]).not.toHaveProperty("price");
    expect(cartApi.addLine.mock.calls[0]?.[0]).not.toHaveProperty("image");
    expect(cartApi.addLine.mock.calls[0]?.[0]).not.toHaveProperty("productId");
  });
});

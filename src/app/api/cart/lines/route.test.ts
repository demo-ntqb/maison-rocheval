// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getCartId: vi.fn(),
  setCartId: vi.fn(),
  clearCartId: vi.fn(),
  createCartWithLines: vi.fn(),
  addCaviar: vi.fn(),
  addGiftSet: vi.fn(),
  logCartEvent: vi.fn(),
}));

vi.mock("@/shared/lib/shopify/cart", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/shopify/cart")>();
  return {
    ...actual,
    getCartId: mocks.getCartId,
    setCartId: mocks.setCartId,
    clearCartId: mocks.clearCartId,
    createCartWithLines: mocks.createCartWithLines,
    addCaviar: mocks.addCaviar,
    addGiftSet: mocks.addGiftSet,
  };
});

vi.mock("@/shared/lib/shopify/cart/cart.logger", () => ({
  logCartEvent: mocks.logCartEvent,
}));

import { POST } from "./route";

const SNAPSHOT = {
  entries: [],
  itemCount: 3,
  subtotal: { amount: "300.00", currencyCode: "SGD" },
  countryCode: "SG" as const,
  warnings: [],
};

function request(body: unknown) {
  return new Request("https://maison.test/api/cart/lines", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://maison.test",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/cart/lines", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCartId.mockResolvedValue(null);
    mocks.createCartWithLines.mockResolvedValue({
      cartId: "gid://shopify/Cart/secret?key=do-not-expose",
      rawCart: {},
      snapshot: SNAPSHOT,
      warnings: [],
    });
  });

  it("lazily creates a gift cart with one line per physical unit and never returns cart ID", async () => {
    const response = await POST(
      request({
        kind: "gift_set",
        merchandiseId: "gid://shopify/ProductVariant/123",
        quantity: 3,
        unitIds: ["unit-a", "unit-b", "unit-c"],
        operationId: "operation-1",
        locale: "en-sg",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCartWithLines).toHaveBeenCalledTimes(1);
    const input = mocks.createCartWithLines.mock.calls[0]?.[0] as { lines: Array<Record<string, unknown>> };
    expect(input.lines).toHaveLength(3);
    expect(input.lines.every((line) => line.quantity === 1)).toBe(true);
    expect(mocks.setCartId).toHaveBeenCalledWith("gid://shopify/Cart/secret?key=do-not-expose");

    const body = await response.json();
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("gid://shopify/Cart/");
    expect(serialized).not.toContain("do-not-expose");
    expect(body.operationId).toBe("operation-1");
  });

  it("rejects browser-authoritative product payloads only by ignoring unsupported fields", async () => {
    const response = await POST(
      request({
        kind: "caviar",
        merchandiseId: "gid://shopify/ProductVariant/123",
        quantity: 1,
        operationId: "operation-2",
        locale: "en-sg",
        price: "0.01",
        currency: "USD",
        inventory: 999,
        title: "Forged title",
      }),
    );

    expect(response.status).toBe(200);
    const input = mocks.createCartWithLines.mock.calls[0]?.[0] as { lines: Array<Record<string, unknown>> };
    expect(input.lines).toEqual([
      {
        merchandiseId: "gid://shopify/ProductVariant/123",
        quantity: 1,
        attributes: [{ key: "_mr_kind", value: "caviar" }],
      },
    ]);
  });

  it("rejects cross-origin mutations before touching Shopify", async () => {
    const crossOrigin = new Request("https://maison.test/api/cart/lines", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://evil.test",
      },
      body: JSON.stringify({
        kind: "caviar",
        merchandiseId: "gid://shopify/ProductVariant/123",
        quantity: 1,
        operationId: "operation-3",
        locale: "en-sg",
      }),
    });

    const response = await POST(crossOrigin);
    expect(response.status).toBe(403);
    expect(mocks.createCartWithLines).not.toHaveBeenCalled();
  });
});

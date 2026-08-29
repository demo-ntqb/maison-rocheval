// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getCartId: vi.fn(),
  getCart: vi.fn(),
  setCartId: vi.fn(),
  clearCartId: vi.fn(),
}));

vi.mock("@/shared/lib/shopify/cart", () => ({
  getCartId: mocks.getCartId,
  getCart: mocks.getCart,
  setCartId: mocks.setCartId,
  clearCartId: mocks.clearCartId,
}));

import { GET } from "./route";

describe("GET /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty snapshot without creating Shopify cart when cookie is absent", async () => {
    mocks.getCartId.mockResolvedValue(null);

    const response = await GET(new Request("https://maison.test/api/cart?locale=en-sg"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.cart.entries).toEqual([]);
    expect(body.cart.itemCount).toBe(0);
    expect(mocks.getCart).not.toHaveBeenCalled();
  });

  it("clears a stale cart cookie and falls back to an empty cart", async () => {
    mocks.getCartId.mockResolvedValue("gid://shopify/Cart/stale?key=secret");
    mocks.getCart.mockResolvedValue(null);

    const response = await GET(new Request("https://maison.test/api/cart?locale=en-sg"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.clearCartId).toHaveBeenCalledTimes(1);
    expect(body.cart.entries).toEqual([]);
    expect(JSON.stringify(body)).not.toContain("stale?key=secret");
  });

  it("restores an authoritative Shopify snapshot while keeping cart ID server-only", async () => {
    mocks.getCartId.mockResolvedValue("gid://shopify/Cart/current?key=secret");
    mocks.getCart.mockResolvedValue({
      cartId: "gid://shopify/Cart/current?key=secret",
      snapshot: {
        entries: [],
        itemCount: 0,
        subtotal: { amount: "0.00", currencyCode: "SGD" },
        countryCode: "SG",
        warnings: [],
      },
      rawCart: {},
      warnings: [],
    });

    const response = await GET(new Request("https://maison.test/api/cart?locale=en-sg"));
    const body = await response.json();

    expect(mocks.setCartId).toHaveBeenCalledWith("gid://shopify/Cart/current?key=secret");
    expect(JSON.stringify(body)).not.toContain("gid://shopify/Cart/");
    expect(JSON.stringify(body)).not.toContain("?key=");
  });
});

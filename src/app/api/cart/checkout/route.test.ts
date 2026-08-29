// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  clearCartId: vi.fn(),
  getCartId: vi.fn(),
  getCheckoutCart: vi.fn(),
  logCartEvent: vi.fn(),
  setCartId: vi.fn(),
}));

vi.mock("@/shared/lib/shopify/cart", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/shopify/cart")>();
  return {
    ...actual,
    clearCartId: mocks.clearCartId,
    getCartId: mocks.getCartId,
    getCheckoutCart: mocks.getCheckoutCart,
    setCartId: mocks.setCartId,
  };
});

vi.mock("@/shared/lib/shopify/cart/cart.logger", () => ({
  logCartEvent: mocks.logCartEvent,
}));

import { POST } from "./route";

function request(origin = "https://maison.test") {
  return new Request("https://maison.test/api/cart/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ locale: "en-sg" }),
  });
}

describe("POST /api/cart/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCartId.mockResolvedValue(null);
  });

  it("rejects an empty cart before calling Shopify", async () => {
    const response = await POST(request());

    expect(response.status).toBe(409);
    expect(mocks.getCheckoutCart).not.toHaveBeenCalled();
  });

  it("clears a stale cart cookie and does not expose its Shopify ID", async () => {
    mocks.getCartId.mockResolvedValue("gid://shopify/Cart/stale?key=secret");
    mocks.getCheckoutCart.mockResolvedValue(null);

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(mocks.clearCartId).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(body)).not.toContain("gid://shopify/Cart/");
    expect(JSON.stringify(body)).not.toContain("secret");
  });

  it("returns only the checkout URL, never the Shopify Cart ID", async () => {
    mocks.getCartId.mockResolvedValue("gid://shopify/Cart/current?key=secret");
    mocks.getCheckoutCart.mockResolvedValue({
      id: "gid://shopify/Cart/current?key=secret",
      totalQuantity: 1,
      checkoutUrl: "https://shop.example/checkouts/current",
      buyerIdentity: { countryCode: "SG" },
    });

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ checkoutUrl: "https://shop.example/checkouts/current" });
    expect(mocks.setCartId).toHaveBeenCalledWith("gid://shopify/Cart/current?key=secret");
    expect(JSON.stringify(body)).not.toContain("gid://shopify/Cart/");
    expect(JSON.stringify(body)).not.toContain("secret");
  });

  it("rejects cross-origin checkout before reading the cart", async () => {
    const response = await POST(request("https://evil.test"));

    expect(response.status).toBe(403);
    expect(mocks.getCartId).not.toHaveBeenCalled();
    expect(mocks.getCheckoutCart).not.toHaveBeenCalled();
  });
});

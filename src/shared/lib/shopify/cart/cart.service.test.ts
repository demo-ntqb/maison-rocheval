// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("../storefront-config", () => ({
  resolveStorefrontConfig: () => ({
    privateStorefrontToken: "shpat_test_private_token",
    storeDomain: "maison-rocheval.myshopify.com",
  }),
}));

describe("Shopify Cart Transport & Buyer Context (Phase 8)", () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
  });

  it("tạo Shopify Cart với đúng buyer identity country và nhận về checkoutUrl", async () => {
    fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              cartCreate: {
                cart: {
                  id: "gid://shopify/Cart/test-cart-123",
                  checkoutUrl: "https://maison-rocheval.myshopify.com/checkouts/cn/test-cart-123",
                  cost: {
                    totalAmount: { amount: "159.00", currencyCode: "SGD" },
                    subtotalAmount: { amount: "159.00", currencyCode: "SGD" },
                  },
                  lines: {
                    nodes: [
                      {
                        id: "line-1",
                        quantity: 1,
                        merchandise: { availableForSale: true },
                      },
                    ],
                  },
                },
                userErrors: [],
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { createShopifyCart } = await import("./cart.service");
    const result = await createShopifyCart("SG", "EN", [
      { merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 },
    ]);

    expect(result).toBeDefined();
    expect(result?.id).toBe("gid://shopify/Cart/test-cart-123");
    expect(result?.checkoutUrl).toContain("/checkouts/");
    expect(result?.totalAmount).toBe(159);
    expect(result?.currencyCode).toBe("SGD");

    // Verify fetch payload
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const payload = JSON.parse(lastCall[1].body);
    expect(payload.variables.country).toBe("SG");
    expect(payload.variables.input.buyerIdentity.countryCode).toBe("SG");

    globalThis.fetch = originalFetch;
  });

  it("cập nhật buyer identity khi đổi country và nhận về repriced total/currency", async () => {
    fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              cartBuyerIdentityUpdate: {
                cart: {
                  id: "gid://shopify/Cart/test-cart-123",
                  checkoutUrl: "https://maison-rocheval.myshopify.com/checkouts/cn/test-cart-123-us",
                  cost: {
                    totalAmount: { amount: "120.00", currencyCode: "USD" },
                    subtotalAmount: { amount: "120.00", currencyCode: "USD" },
                  },
                },
                userErrors: [],
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { updateShopifyCartBuyerIdentity } = await import("./cart.service");
    const result = await updateShopifyCartBuyerIdentity("gid://shopify/Cart/test-cart-123", "US", "EN");

    expect(result).toBeDefined();
    expect(result?.totalAmount).toBe(120);
    expect(result?.currencyCode).toBe("USD");

    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const payload = JSON.parse(lastCall[1].body);
    expect(payload.variables.country).toBe("US");
    expect(payload.variables.buyerIdentity.countryCode).toBe("US");

    globalThis.fetch = originalFetch;
  });
});

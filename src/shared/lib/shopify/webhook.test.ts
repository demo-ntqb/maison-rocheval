import { describe, expect, it } from "vitest";

import { shopifyWebhookTags } from "./webhook";

describe("Shopify Webhook Tag Mapping (Phase 1 Regression)", () => {
  const EXPECTED_MARKET_TAGS = ["shopify-localization", "shopify-market-context"];

  describe("Market topics cache invalidation tags", () => {
    it("map markets/create sang shopify-localization và shopify-market-context", () => {
      const tags = shopifyWebhookTags("markets/create", {});
      // Expected contract: markets/create must invalidate localization and market context
      // Currently fails: returns []
      expect(tags).toEqual(expect.arrayContaining(EXPECTED_MARKET_TAGS));
      expect(tags).toContain("shopify-localization");
      expect(tags).toContain("shopify-market-context");
    });

    it("map markets/update sang shopify-localization và shopify-market-context", () => {
      const tags = shopifyWebhookTags("markets/update", {});
      // Expected contract: markets/update must invalidate localization and market context
      // Currently fails: returns []
      expect(tags).toEqual(expect.arrayContaining(EXPECTED_MARKET_TAGS));
      expect(tags).toContain("shopify-localization");
      expect(tags).toContain("shopify-market-context");
    });

    it("map markets/delete sang shopify-localization và shopify-market-context", () => {
      const tags = shopifyWebhookTags("markets/delete", {});
      // Expected contract: markets/delete must invalidate localization and market context
      // Currently fails: returns []
      expect(tags).toEqual(expect.arrayContaining(EXPECTED_MARKET_TAGS));
      expect(tags).toContain("shopify-localization");
      expect(tags).toContain("shopify-market-context");
    });
  });

  describe("Locale topics cache invalidation tags", () => {
    it("map locales/update sang shopify-localization và shopify-market-context", () => {
      const tags = shopifyWebhookTags("locales/update", {});
      // Expected contract: locales/update must invalidate localization and market context
      // Currently fails: returns []
      expect(tags).toEqual(expect.arrayContaining(EXPECTED_MARKET_TAGS));
      expect(tags).toContain("shopify-localization");
      expect(tags).toContain("shopify-market-context");
    });
  });

  describe("Bảo toàn mapping các topics hiện có", () => {
    it("giữ nguyên product tags mapping", () => {
      const tags = shopifyWebhookTags("products/update", { handle: "kaluga" });
      expect(tags).toEqual(["shopify-products", "shopify-product-kaluga"]);
    });

    it("giữ nguyên collection tags mapping", () => {
      const tags = shopifyWebhookTags("collections/update", { handle: "caviar" });
      expect(tags).toEqual(["shopify-collections", "shopify-collection-caviar"]);
    });

    it("giữ nguyên metaobject tags mapping", () => {
      const tags = shopifyWebhookTags("metaobjects/update", {});
      expect(tags).toEqual(["shopify-products", "shopify-metaobjects"]);
    });
  });

  describe("HMAC Signature Verification", () => {
    const secret = "test_webhook_secret_key";
    const body = JSON.stringify({ id: 12345 });

    it("xác thực thành công với đúng HMAC signature", async () => {
      const { createHmac } = await import("node:crypto");
      const validHmac = createHmac("sha256", secret).update(body).digest("base64");
      const { verifyShopifyWebhookHmac } = await import("./webhook");

      expect(verifyShopifyWebhookHmac(body, validHmac, secret)).toBe(true);
    });

    it("từ chối signature sai hoặc secret rỗng", async () => {
      const { verifyShopifyWebhookHmac } = await import("./webhook");

      expect(verifyShopifyWebhookHmac(body, "invalid_hmac_signature", secret)).toBe(false);
      expect(verifyShopifyWebhookHmac(body, null, secret)).toBe(false);
      expect(verifyShopifyWebhookHmac(body, "valid_hmac", "")).toBe(false);
    });
  });
});


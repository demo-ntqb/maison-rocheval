import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }));

vi.mock("next/cache", () => ({ revalidateTag }));

import { POST } from "./route";

const SECRET = "shopify-webhook-secret";
const SHOP_DOMAIN = "maison-rocheval.myshopify.com";

function webhookRequest(topic: string, payload: Record<string, unknown>): Request {
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", SECRET).update(body).digest("base64");

  return new Request("https://maison-rocheval.test/api/shopify/webhooks", {
    body,
    headers: {
      "content-type": "application/json",
      "x-shopify-hmac-sha256": signature,
      "x-shopify-shop-domain": SHOP_DOMAIN,
      "x-shopify-topic": topic,
    },
    method: "POST",
  });
}

describe("Shopify webhook route", () => {
  beforeEach(() => {
    process.env.SHOPIFY_ADMIN_CLIENT_SECRET = SECRET;
    process.env.SHOPIFY_ADMIN_STORE_DOMAIN = SHOP_DOMAIN;
    revalidateTag.mockClear();
  });

  afterEach(() => {
    delete process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
    delete process.env.SHOPIFY_ADMIN_STORE_DOMAIN;
  });

  it("revalidate cả broad tag và targeted product tag", async () => {
    const response = await POST(webhookRequest("products/update", { handle: "kaluga" }));

    expect(response.status).toBe(204);
    expect(revalidateTag.mock.calls).toEqual([
      ["shopify-products", { expire: 0 }],
      ["shopify-product-kaluga", { expire: 0 }],
    ]);
  });
});

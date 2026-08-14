import { createHmac, timingSafeEqual } from "node:crypto";

export type ShopifyWebhookPayload = {
  handle?: unknown;
  type?: unknown;
};

export function verifyShopifyWebhookHmac(
  rawBody: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header || !secret) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("base64"), "base64");
  const received = Buffer.from(header, "base64");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function shopifyWebhookTags(
  topic: string,
  payload: ShopifyWebhookPayload,
): string[] {
  const normalizedTopic = topic.toLowerCase();
  if (normalizedTopic.startsWith("products/")) {
    return [
      "shopify-products",
      ...(typeof payload.handle === "string" ? [`shopify-product-${payload.handle}`] : []),
    ];
  }
  if (normalizedTopic.startsWith("collections/")) {
    return [
      "shopify-collections",
      ...(typeof payload.handle === "string" ? [`shopify-collection-${payload.handle}`] : []),
    ];
  }
  if (normalizedTopic.startsWith("metaobjects/")) {
    return ["shopify-products", "shopify-metaobjects"];
  }
  return [];
}

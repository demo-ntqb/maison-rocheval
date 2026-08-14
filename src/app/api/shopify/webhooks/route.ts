import { revalidateTag } from "next/cache";

import { storefrontConfig } from "@/shared/lib/shopify/config";
import {
  shopifyWebhookTags,
  verifyShopifyWebhookHmac,
} from "@/shared/lib/shopify/webhook";

const SUPPORTED_TOPICS = new Set([
  "collections/create",
  "collections/delete",
  "collections/update",
  "metaobjects/create",
  "metaobjects/delete",
  "metaobjects/update",
  "products/create",
  "products/delete",
  "products/update",
]);

function normalizeShopDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//u, "").replace(/\/$/u, "");
}

function hasExpectedShopDomain(request: Request): boolean {
  const expectedShop = normalizeShopDomain(
    process.env.SHOPIFY_ADMIN_STORE_DOMAIN || storefrontConfig.storeDomain,
  );
  const requestShop = normalizeShopDomain(request.headers.get("x-shopify-shop-domain") ?? "");
  return Boolean(expectedShop) && requestShop === expectedShop;
}

function parseWebhookPayload(rawBody: string): { handle?: unknown } | null {
  try {
    return JSON.parse(rawBody) as { handle?: unknown };
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const secret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET?.trim() ?? "";

  if (!secret || !verifyShopifyWebhookHmac(rawBody, signature, secret)) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic")?.toLowerCase() ?? "";
  if (!SUPPORTED_TOPICS.has(topic)) {
    return Response.json({ error: "Unsupported webhook topic" }, { status: 400 });
  }

  if (!hasExpectedShopDomain(request)) {
    return Response.json({ error: "Invalid shop domain" }, { status: 401 });
  }

  const payload = parseWebhookPayload(rawBody);
  if (!payload) {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  for (const tag of shopifyWebhookTags(topic, payload)) {
    revalidateTag(tag, { expire: 0 });
  }

  return new Response(null, { status: 204 });
}

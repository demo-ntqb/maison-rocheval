#!/usr/bin/env node

/**
 * Manual Cache Revalidation CLI
 * Usage:
 *   node scripts/revalidate-cache.mjs
 *   node scripts/revalidate-cache.mjs --handle=kaluga
 *   node scripts/revalidate-cache.mjs --tag=shopify-products
 *   node scripts/revalidate-cache.mjs --origin=https://maison-rocheval.com
 */

import { parseArgs } from "node:util";

const { values } = parseArgs({
  allowPositionals: false,
  options: {
    collection: { type: "string" },
    handle: { type: "string" },
    origin: { type: "string" },
    secret: { type: "string" },
    tag: { type: "string" },
  },
});

const origin = (
  values.origin ||
  process.env.SITE_ORIGIN ||
  "http://localhost:3000"
).replace(/\/$/u, "");

const DEFAULT_REVALIDATE_SECRET = "maison-rocheval-revalidate-secret";

const secret =
  values.secret ||
  process.env.REVALIDATE_SECRET_TOKEN ||
  process.env.SHOPIFY_ADMIN_CLIENT_SECRET ||
  DEFAULT_REVALIDATE_SECRET;

const endpoint = `${origin}/api/revalidate`;

const body = {
  ...(values.tag ? { tag: values.tag } : {}),
  ...(values.handle ? { handle: values.handle } : {}),
  ...(values.collection ? { collection: values.collection } : {}),
};

console.log(`📡 Sending cache purge request to ${endpoint}...`);

try {
  const response = await fetch(endpoint, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ Cache purge failed (${response.status}):`, data);
    process.exit(1);
  }

  console.log("✅ Cache successfully revalidated!");
  console.log("🏷️  Revalidated tags:", data.tags.join(", "));
} catch (err) {
  console.error("❌ Network or request error:", err.message);
  process.exit(1);
}

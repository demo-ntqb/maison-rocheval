import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, repoRoot), "utf8");
}

test("Products catalog lấy canonical order từ Shopify collection", async () => {
  const [service, query, section] = await Promise.all([
    source("src/shared/lib/shopify/catalog/catalog.service.ts"),
    source("src/shared/lib/shopify/catalog/catalog-collection.query.ts"),
    source("src/screens/products/sections/products-catalog.section.tsx"),
  ]);

  assert.match(query, /collection\(handle:\s*\$handle\)/);
  assert.match(service, /mapCollectionProducts/);
  assert.match(section, /getCollectionProducts\(locale, "our-caviar"\)/);
  assert.doesNotMatch(section, /products\.constant|PRODUCTS/);
});

test("Product card dùng ảnh responsive từ Shopify CDN", async () => {
  const [card, image] = await Promise.all([
    source("src/screens/products/components/products-product-card.tsx"),
    source("src/shared/components/ui/shopify-image.tsx"),
  ]);

  assert.match(card, /ShopifyImage/);
  assert.match(image, /shopifyImageSrcSet/);
  assert.match(image, /width=\{image\.width\}/);
  assert.match(image, /height=\{image\.height\}/);
});

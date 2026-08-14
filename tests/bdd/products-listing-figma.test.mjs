import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../../", import.meta.url);

async function source(path) {
  try {
    return await readFile(new URL(path, repoRoot), "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

test("Products route là thin localized composition và có metadata riêng", async () => {
  const page = await source("src/app/[locale]/products/page.tsx");

  assert.match(page, /from "@\/screens\/products"/);
  assert.match(page, /generatePageMetadata/);
  assert.match(page, /canonical:\s*"\/products"/);

  const order = [
    "<ProductsHeroSection",
    "<ProductsCatalogSection",
    "<ProductsEditorialSection",
    "<ProductsFaqSection",
  ].map((token) => page.indexOf(token));

  assert.ok(order.every((index) => index >= 0), "Route phải compose đủ bốn section Products");
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test("Products screen tuân thủ ownership và barrel contract", async () => {
  const index = await source("src/screens/products/index.ts");
  const catalog = await source("src/screens/products/sections/products-catalog.section.tsx");
  const grid = await source("src/screens/products/components/products-product-grid.tsx");
  const card = await source("src/screens/products/components/products-product-card.tsx");

  assert.match(index, /products-hero\.section/);
  assert.match(index, /products-catalog\.section/);
  assert.match(index, /products-editorial\.section/);
  assert.match(index, /products-faq\.section/);
  assert.doesNotMatch(index, /components|constants|types/);

  assert.match(catalog, /getCollectionProducts/);
  assert.match(catalog, /our-caviar/);
  assert.doesNotMatch(catalog, /PRODUCTS/);
  assert.match(grid, /<ul/);
  assert.match(grid, /grid-cols-1/);
  assert.match(grid, /sm:grid-cols-2/);
  assert.match(grid, /lg:grid-cols-3/);
  assert.match(card, /<article/);
  assert.match(card, /priority=|priority\s*\?/);
  assert.doesNotMatch(card, /next\/image/);
});

test("Products copy và metadata tồn tại đồng thời ở mọi locale", async () => {
  const [en, fr] = await Promise.all([
    source("messages/en.json").then(JSON.parse),
    source("messages/fr.json").then(JSON.parse),
  ]);

  for (const messages of [en, fr]) {
    assert.ok(messages.metadata?.products?.title);
    assert.ok(messages.metadata?.products?.description);
    assert.ok(messages.products?.catalog?.itemCount);
    assert.ok(messages.products?.editorial?.title);
    assert.ok(messages.products?.faq?.title);
  }
});

test("Products image contract dùng ShopifyImage helper và shared accessible FAQ", async () => {
  const [card, editorial, faq] = await Promise.all([
    source("src/screens/products/components/products-product-card.tsx"),
    source("src/screens/products/sections/products-editorial.section.tsx"),
    source("src/screens/products/sections/products-faq.section.tsx"),
  ]);

  assert.match(card, /<ShopifyImage/);
  assert.match(card, /image=\{/);
  assert.match(card, /sizes=/);
  assert.match(editorial, /<Picture/);
  assert.match(editorial, /@\/i18n\/navigation/);
  assert.match(faq, /FaqSection/);
});

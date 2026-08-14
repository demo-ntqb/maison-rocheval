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

test("Home và Products đọc Shopify collections thay cho mock content", async () => {
  const [service, query, home, products] = await Promise.all([
    source("src/shared/lib/shopify/catalog/catalog.service.ts"),
    source("src/shared/lib/shopify/catalog/catalog-collection.query.ts"),
    source("src/screens/home/sections/home-products.section.tsx"),
    source("src/screens/products/sections/products-catalog.section.tsx"),
  ]);

  assert.match(query, /collection\(handle:\s*\$handle\)/);
  assert.match(service, /mapCollectionProducts/);
  assert.match(home, /featured-caviar/);
  assert.match(home, /getCollectionProducts/);
  assert.doesNotMatch(home, /HOME_PRODUCTS/);
  assert.match(products, /our-caviar/);
  assert.match(products, /getCollectionProducts/);
  assert.doesNotMatch(products, /PRODUCTS/);
});

test("About product selector đọc Shopify profile và render interactive Tabs", async () => {
  const [route, section, tabs, panel, utils, query, service] = await Promise.all([
    source("src/app/[locale]/about-the-product/page.tsx"),
    source("src/screens/about-the-product/sections/about-understand.section.tsx"),
    source("src/screens/about-the-product/components/about-understand-product-tabs.tsx"),
    source("src/screens/about-the-product/components/about-understand-product-panel.tsx"),
    source("src/screens/about-the-product/lib/about-the-product.utils.ts"),
    source("src/shared/lib/shopify/catalog/catalog-collection.query.ts"),
    source("src/shared/lib/shopify/catalog/catalog.service.ts"),
  ]);

  assert.match(route, /<AboutUnderstandSection locale=\{locale\}/);
  assert.match(section, /getCollectionProductProfiles/);
  assert.match(section, /our-caviar/);
  assert.match(tabs, /TabsList/);
  assert.match(tabs, /TabsTrigger/);
  assert.match(panel, /TabsContent/);
  assert.match(panel, /ShopifyImage/);
  assert.match(utils, /product\.specs\.pearlSize/);
  assert.match(utils, /product\.specs\.salt/);
  assert.match(utils, /product\.specs\.color/);
  assert.match(utils, /product\.specs\.tastingNotes/);
  assert.match(panel, /`\/products\/\$\{product\.handle\}`/);
  assert.match(query, /pearl_size/);
  assert.match(query, /salt_content/);
  assert.match(query, /pearl_colour/);
  assert.match(service, /getCollectionProductProfiles/);
});

test("Product detail dùng Shopify variants và canonical route behavior", async () => {
  const [route, hero, configurator, query] = await Promise.all([
    source("src/app/[locale]/products/[handle]/page.tsx"),
    source("src/screens/product-detail/sections/product-detail-hero.section.tsx"),
    source("src/screens/product-detail/lib/product-detail-configurator.ts"),
    source("src/shared/lib/shopify/catalog/catalog-detail.query.ts"),
  ]);

  assert.match(route, /getProductDetail/);
  assert.match(route, /permanentRedirect/);
  assert.match(route, /notFound/);
  assert.match(route, /generateMetadata/);
  assert.match(hero, /product:/);
  assert.doesNotMatch(hero, /getProductDetail\(handle\)/);
  assert.match(configurator, /activeVariant\?\.price\.amount/);
  assert.doesNotMatch(configurator, /sizeMultiplier/);
  assert.match(query, /related_products/);
  assert.match(query, /presentation-box/);
});

test("SEO, sitemap và Shopify webhook cache invalidation có server boundary", async () => {
  const [route, sitemap, webhook, webhookLib] = await Promise.all([
    source("src/app/[locale]/products/[handle]/page.tsx"),
    source("src/app/sitemap.ts"),
    source("src/app/api/shopify/webhooks/route.ts"),
    source("src/shared/lib/shopify/webhook.ts"),
  ]);

  assert.match(route, /application\/ld\+json/);
  assert.match(sitemap, /getCatalogHandles/);
  assert.match(webhook, /revalidateTag/);
  assert.match(webhook, /SHOPIFY_ADMIN_CLIENT_SECRET/);
  assert.match(webhookLib, /timingSafeEqual/);
  assert.match(webhookLib, /createHmac/);
});

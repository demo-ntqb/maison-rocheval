import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { SHOPIFY_PROVISIONING_MANIFEST } from "../../scripts/shopify/provision/manifest.mjs";

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

test("public CLI tách plan, apply và verify", async () => {
  const packageJson = JSON.parse(await source("package.json"));

  assert.equal(packageJson.scripts["shopify:provision:plan"], "node scripts/shopify/provision/index.mjs plan");
  assert.equal(packageJson.scripts["shopify:provision:apply"], "node scripts/shopify/provision/index.mjs apply");
  assert.equal(packageJson.scripts["shopify:provision:verify"], "node scripts/shopify/provision/index.mjs verify");
  assert.equal(
    packageJson.scripts["shopify:migrate:remove-caviar-species:plan"],
    "node scripts/shopify/migrations/remove-caviar-species.mjs plan",
  );
  assert.equal(
    packageJson.scripts["shopify:migrate:remove-caviar-species:apply"],
    "node scripts/shopify/migrations/remove-caviar-species.mjs apply",
  );
});

test("manifest định nghĩa canonical catalog và packaging không tổ hợp", async () => {
  const manifest = await source("scripts/shopify/provision/manifest.mjs");

  const caviar = SHOPIFY_PROVISIONING_MANIFEST.products.filter(({ kind }) => kind === "caviar");
  assert.deepEqual(caviar.map(({ handle }) => handle), [
    "amour",
    "kaluga",
    "russian-hybrid",
    "lexpression",
    "harmonie",
  ]);
  assert.ok(caviar.every(({ variants }) => (
    variants.map(({ option }) => option).join(",") === "30g,50g,125g,250g"
  )));

  for (const handle of ["amour", "kaluga", "russian-hybrid", "lexpression", "harmonie"]) {
    assert.match(manifest, new RegExp(`handle: ["']${handle}["']`));
  }
  assert.match(manifest, /handle: ["']our-caviar["']/);
  assert.match(manifest, /handle: ["']featured-caviar["']/);
  assert.match(manifest, /handle: ["']presentation-box["']/);
  assert.match(manifest, /option: ["']Premium["'][\s\S]*?price: ["']32\.00["']/);
  assert.match(manifest, /option: ["']Luxury["'][\s\S]*?price: ["']74\.00["']/);
  assert.match(manifest, /handle: ["']standard["'][\s\S]*?price: ["']0\.00["']/);
  assert.match(manifest, /key: ["']species_scientific_name["']/);
  assert.match(manifest, /key: ["']species_description["']/);
  assert.doesNotMatch(manifest, /type: ["']caviar_species["']/);
});

test("provisioning pin Admin API và không chứa destructive operations", async () => {
  const [client, operations] = await Promise.all([
    source("scripts/shopify/provision/admin-client.mjs"),
    source("scripts/shopify/provision/operations.mjs"),
  ]);

  assert.match(client, /2026-07/);
  assert.match(client, /SHOPIFY_ADMIN_STORE_DOMAIN/);
  assert.match(client, /SHOPIFY_ADMIN_ACCESS_TOKEN/);
  assert.match(client, /SHOPIFY_ADMIN_CLIENT_ID/);
  assert.match(client, /SHOPIFY_ADMIN_CLIENT_SECRET/);
  assert.doesNotMatch(operations, /\bdelete[A-Z]|\binventory(?:Set|Adjust)Quantities/);
  assert.doesNotMatch(
    operations,
    /admin:\s*["']MERCHANT_READ_WRITE["']/,
    "merchant-owned custom data must not configure app-owned Admin access",
  );
  assert.doesNotMatch(
    operations,
    /name:\s*["']required["']/,
    "metaobject required must use the dedicated boolean field",
  );
  assert.match(operations, /fieldDefinitions[\s\S]*?required/);
  const state = await source("scripts/shopify/provision/state.mjs");
  assert.match(state, /number_decimal/);
  assert.match(operations, /selectTranslatableValues/);
  assert.match(state, /selectTranslatableValues/);
});

test("operator contract mô tả env, scopes và dry-run workflow", async () => {
  const [envExample, readme] = await Promise.all([
    source(".env.example"),
    source("README.md"),
  ]);

  assert.match(envExample, /SHOPIFY_ADMIN_STORE_DOMAIN=/);
  assert.match(envExample, /SHOPIFY_ADMIN_ACCESS_TOKEN=/);
  assert.match(envExample, /SHOPIFY_ADMIN_CLIENT_ID=/);
  assert.match(envExample, /SHOPIFY_ADMIN_CLIENT_SECRET=/);
  assert.match(readme, /shopify:provision:plan/);
  assert.match(readme, /shopify:provision:apply/);
  assert.match(readme, /shopify:provision:verify/);
  assert.match(readme, /shopify:migrate:remove-caviar-species:plan/);
  assert.match(readme, /write_products/);
  assert.match(readme, /write_metaobjects/);
  assert.match(readme, /read_locales/);
});

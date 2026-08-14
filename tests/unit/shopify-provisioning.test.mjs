import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "graphql";

import {
  createAdminClient,
  resolveAdminConfig,
  SHOPIFY_ADMIN_API_VERSION,
} from "../../scripts/shopify/provision/admin-client.mjs";
import { SHOPIFY_PROVISIONING_MANIFEST } from "../../scripts/shopify/provision/manifest.mjs";
import {
  productTextMetafieldValues,
  selectTranslatableValues,
  upsertMetafieldDefinition,
  upsertMetaobjectDefinition,
  upsertProduct,
} from "../../scripts/shopify/provision/operations.mjs";
import {
  buildProvisionPlan,
  compileDesiredResources,
} from "../../scripts/shopify/provision/planner.mjs";
import { runProvisioningCommand } from "../../scripts/shopify/provision/command.mjs";
import {
  loadCurrentResources,
  managedProductFieldsMatch,
  metafieldDefinitionMatches,
  productMetafieldsMatch,
  shopifyFieldValueMatches,
} from "../../scripts/shopify/provision/state.mjs";

test("manifest giữ canonical products, variants, collections và packaging", () => {
  const manifest = SHOPIFY_PROVISIONING_MANIFEST;
  const caviar = manifest.products.filter((product) => product.kind === "caviar");

  assert.deepEqual(
    caviar.map((product) => product.handle),
    ["amour", "kaluga", "russian-hybrid", "lexpression", "harmonie"],
  );
  assert.ok(caviar.every((product) => (
    product.variants.map((variant) => variant.option).join(",") === "30g,50g,125g,250g"
  )));
  assert.ok(caviar.every((product) => (
    product.variants.every((variant) => /^MR-[A-Z-]+-(030|050|125|250)$/u.test(variant.sku))
  )));

  assert.deepEqual(
    manifest.collections.find(({ handle }) => handle === "our-caviar").products,
    ["amour", "kaluga", "russian-hybrid", "lexpression", "harmonie"],
  );
  assert.deepEqual(
    manifest.collections.find(({ handle }) => handle === "featured-caviar").products,
    ["amour", "lexpression", "harmonie"],
  );

  const presentationBox = manifest.products.find(({ handle }) => handle === "presentation-box");
  assert.deepEqual(presentationBox.variants.map(({ option, price }) => ({ option, price })), [
    { option: "Premium", price: "32.00" },
    { option: "Luxury", price: "74.00" },
  ]);

  assert.ok(caviar.every((product) => !("speciesHandle" in product)));
  assert.ok(caviar.every((product) => product.details.speciesScientificName));
  assert.ok(caviar.every((product) => product.details.speciesDescription.en));
  assert.ok(caviar.every((product) => product.details.speciesDescription.fr));
  assert.equal(
    manifest.metaobjectDefinitions.some(({ type }) => type === "caviar_species"),
    false,
  );
  assert.equal("caviarSpecies" in manifest.metaobjects, false);
  assert.deepEqual(
    manifest.metafieldDefinitions
      .filter(({ key }) => key.startsWith("species"))
      .map(({ key, pin, type }) => ({ key, pin, type })),
    [
      { key: "species_scientific_name", pin: true, type: "single_line_text_field" },
      { key: "species_description", pin: true, type: "multi_line_text_field" },
    ],
  );
  assert.ok(manifest.metafieldDefinitions.every(({ pin }) => pin === true));

  const presentationDefinition = manifest.metaobjectDefinitions.find(
    ({ type }) => type === "presentation_option",
  );
  assert.deepEqual(
    presentationDefinition.fields.map(({ key, translatable }) => ({ key, translatable })),
    [
      { key: "name", translatable: true },
      { key: "description", translatable: true },
      { key: "price", translatable: false },
      { key: "personalized_message", translatable: false },
    ],
  );
});

test("product hiện hữu giữ merchant-owned prices và variants", async () => {
  const product = SHOPIFY_PROVISIONING_MANIFEST.products.find(({ handle }) => handle === "amour");
  const current = {
    id: "gid://shopify/Product/1",
    handle: product.handle,
    title: product.content.en.title,
    descriptionHtml: product.content.en.descriptionHtml,
    productType: product.productType,
    vendor: "Maison Rocheval",
    status: "ACTIVE",
    options: [{ name: "Merchant size", optionValues: [{ name: "500g" }] }],
    variants: { nodes: [{ title: "500g", price: "999.00", sku: "MERCHANT-500" }] },
  };

  assert.equal(managedProductFieldsMatch(product, current, "en"), true);

  const calls = [];
  const result = await upsertProduct({
    request: async (document, variables) => {
      calls.push({ document, variables });
      return {
        productUpdate: {
          product: { id: current.id, handle: current.handle },
          userErrors: [],
        },
      };
    },
  }, product, "en", current);

  assert.equal(result.id, current.id);
  assert.match(calls[0].document, /productUpdate/u);
  assert.doesNotMatch(calls[0].document, /productSet/u);
  assert.equal("variants" in calls[0].variables.product, false);
  assert.equal("productOptions" in calls[0].variables.product, false);
});

test("product mới vẫn seed canonical prices và variants bằng productSet", async () => {
  const product = SHOPIFY_PROVISIONING_MANIFEST.products.find(({ handle }) => handle === "amour");
  const calls = [];

  await upsertProduct({
    request: async (document, variables) => {
      calls.push({ document, variables });
      return {
        productSet: {
          product: { id: "gid://shopify/Product/1", handle: product.handle },
          userErrors: [],
        },
      };
    },
  }, product, "en");

  assert.match(calls[0].document, /productSet/u);
  assert.equal(calls[0].variables.input.variants.length, 4);
  assert.deepEqual(
    calls[0].variables.input.variants.map(({ price }) => price),
    product.variants.map(({ price }) => price),
  );
});

test("unpinned Product metafield definition được xem là drift", () => {
  const desired = {
    key: "species_scientific_name",
    name: "Species scientific name",
    pin: true,
    type: "single_line_text_field",
  };
  const actual = {
    access: { storefront: "PUBLIC_READ" },
    key: desired.key,
    name: desired.name,
    pinnedPosition: null,
    type: { name: desired.type },
  };

  assert.equal(metafieldDefinitionMatches(desired, actual), false);
  assert.equal(metafieldDefinitionMatches(desired, { ...actual, pinnedPosition: 1 }), true);
});

test("metafield definition mới và hiện có đều được pin trong Shopify Admin", async () => {
  const calls = [];
  const client = {
    request: async (document, variables) => {
      calls.push({ document, variables });
      if (document.includes("CreateMetafieldDefinition")) {
        return {
          metafieldDefinitionCreate: {
            createdDefinition: {
              id: "gid://shopify/MetafieldDefinition/1",
              key: variables.definition.key,
              namespace: variables.definition.namespace,
              pinnedPosition: 1,
            },
            userErrors: [],
          },
        };
      }
      if (document.includes("UpdateMetafieldDefinition")) {
        return {
          metafieldDefinitionUpdate: {
            updatedDefinition: {
              id: "gid://shopify/MetafieldDefinition/1",
              key: variables.definition.key,
              namespace: variables.definition.namespace,
              pinnedPosition: null,
            },
            userErrors: [],
          },
        };
      }
      return {
        metafieldDefinitionPin: {
          pinnedDefinition: {
            id: "gid://shopify/MetafieldDefinition/1",
            key: variables.identifier.key,
            namespace: variables.identifier.namespace,
            pinnedPosition: 1,
          },
          userErrors: [],
        },
      };
    },
  };
  const definition = {
    namespace: "rocheval",
    key: "species_scientific_name",
    name: "Species scientific name",
    type: "single_line_text_field",
    pin: true,
  };

  await upsertMetafieldDefinition(client, definition);
  await upsertMetafieldDefinition(client, definition, {
    id: "gid://shopify/MetafieldDefinition/1",
    key: definition.key,
    namespace: definition.namespace,
    pinnedPosition: null,
    type: { name: definition.type },
  });

  assert.equal(calls[0].variables.definition.pin, true);
  assert.match(calls[2].document, /metafieldDefinitionPin/);
  assert.deepEqual(calls[2].variables.identifier, {
    ownerType: "PRODUCT",
    namespace: "rocheval",
    key: "species_scientific_name",
  });
});

test("mọi product text metafield có desired values EN và FR", () => {
  const amour = SHOPIFY_PROVISIONING_MANIFEST.products.find(({ handle }) => handle === "amour");
  const en = productTextMetafieldValues(amour, "en");
  const fr = productTextMetafieldValues(amour, "fr");

  assert.deepEqual(Object.keys(en), Object.keys(fr));
  assert.equal(Object.keys(en).length, 13);
  assert.equal(en.species_scientific_name, "Acipenser schrenckii");
  assert.equal(fr.species_scientific_name, "Acipenser schrenckii");
  assert.notEqual(en.species_description, fr.species_description);
  assert.notEqual(en.ingredients, fr.ingredients);
  assert.notEqual(en.storage, fr.storage);
  assert.deepEqual(JSON.parse(fr.tasting_notes), ["Riche", "Crémeux", "Fromager"]);
});

test("merchant-owned definition inputs không cấu hình app-owned Admin access", async () => {
  const variables = [];
  const client = {
    request: async (document, input) => {
      variables.push(input);
      if (document.includes("UpdateMetaobjectDefinition")) {
        return {
          metaobjectDefinitionUpdate: {
            metaobjectDefinition: { id: input.id, type: "presentation_option" },
            userErrors: [],
          },
        };
      }
      if (document.includes("UpdateMetafieldDefinition")) {
        return {
          metafieldDefinitionUpdate: {
            updatedDefinition: {
              id: "gid://shopify/MetafieldDefinition/1",
              namespace: input.definition.namespace,
              key: input.definition.key,
            },
            userErrors: [],
          },
        };
      }
      if (!input.definition.ownerType) {
        return {
          metaobjectDefinitionCreate: {
            metaobjectDefinition: { id: "gid://shopify/MetaobjectDefinition/1", type: input.definition.type },
            userErrors: [],
          },
        };
      }
      return {
        metafieldDefinitionCreate: {
          createdDefinition: {
            id: "gid://shopify/MetafieldDefinition/1",
            namespace: input.definition.namespace,
            key: input.definition.key,
          },
          userErrors: [],
        },
      };
    },
  };

  await upsertMetaobjectDefinition(client, {
    type: "presentation_option",
    name: "Presentation option",
    displayNameKey: "name",
    fields: [{ key: "name", name: "Name", type: "single_line_text_field", required: true }],
  });
  await upsertMetafieldDefinition(client, {
    namespace: "rocheval",
    key: "species_scientific_name",
    name: "Species scientific name",
    type: "single_line_text_field",
  });
  await upsertMetaobjectDefinition(client, {
    type: "presentation_option",
    name: "Presentation option",
    displayNameKey: "name",
    fields: [{ key: "name", name: "Name", type: "single_line_text_field", required: true }],
  }, {
    id: "gid://shopify/MetaobjectDefinition/1",
    fieldDefinitions: [{ key: "name", type: { name: "single_line_text_field" } }],
  });
  await upsertMetafieldDefinition(client, {
    namespace: "rocheval",
    key: "species_scientific_name",
    name: "Species scientific name",
    type: "single_line_text_field",
  }, {
    id: "gid://shopify/MetafieldDefinition/1",
    namespace: "rocheval",
    key: "species_scientific_name",
    type: { name: "single_line_text_field" },
  });

  assert.deepEqual(variables.map(({ definition }) => definition.access), [
    { storefront: "PUBLIC_READ" },
    { storefront: "PUBLIC_READ" },
    { storefront: "PUBLIC_READ" },
    { storefront: "PUBLIC_READ" },
  ]);
});

test("metaobject definition dùng required boolean cho create và update", async () => {
  const variables = [];
  const client = {
    request: async (document, input) => {
      variables.push(input);
      if (document.includes("CreateMetaobjectDefinition")) {
        return {
          metaobjectDefinitionCreate: {
            metaobjectDefinition: { id: "gid://shopify/MetaobjectDefinition/2", type: "required_test" },
            userErrors: [],
          },
        };
      }
      return {
        metaobjectDefinitionUpdate: {
          metaobjectDefinition: { id: input.id, type: "required_test" },
          userErrors: [],
        },
      };
    },
  };
  const definition = {
    type: "required_test",
    name: "Required test",
    displayNameKey: "name",
    fields: [
      { key: "name", name: "Name", type: "single_line_text_field", required: true },
      { key: "description", name: "Description", type: "multi_line_text_field" },
    ],
  };

  await upsertMetaobjectDefinition(client, definition);
  await upsertMetaobjectDefinition(client, definition, {
    id: "gid://shopify/MetaobjectDefinition/2",
    fieldDefinitions: definition.fields.map((field) => ({
      key: field.key,
      type: { name: field.type },
    })),
  });

  assert.deepEqual(variables[0].definition.fieldDefinitions, [
    { key: "name", name: "Name", type: "single_line_text_field", required: true },
    { key: "description", name: "Description", type: "multi_line_text_field", required: false },
  ]);
  assert.deepEqual(variables[1].definition.fieldDefinitions, [
    { update: { key: "name", name: "Name", required: true } },
    { update: { key: "description", name: "Description", required: false } },
  ]);
});

test("planner tạo dependency-ordered create plan và hội tụ thành no-op", () => {
  const desired = compileDesiredResources(SHOPIFY_PROVISIONING_MANIFEST);
  const plan = buildProvisionPlan(SHOPIFY_PROVISIONING_MANIFEST, []);

  assert.equal(plan.length, desired.length);
  assert.ok(plan.every((action) => action.operation === "CREATE"));
  assert.ok(plan.every((action) => !action.key.includes("caviar_species")));
  assert.deepEqual(
    [...new Set(plan.map((action) => action.phase))],
    ["definitions", "metaobjects", "products", "product-content", "collections", "localization", "publication"],
  );

  const convergedState = desired.map(({ key, kind, signature }) => ({ key, kind, signature }));
  assert.deepEqual(buildProvisionPlan(SHOPIFY_PROVISIONING_MANIFEST, convergedState), []);
});

test("planner update drift nhưng không delete unmanaged resources", () => {
  const desired = compileDesiredResources(SHOPIFY_PROVISIONING_MANIFEST);
  const [first, ...rest] = desired;
  const current = [
    { key: first.key, kind: first.kind, signature: "outdated" },
    ...rest.map(({ key, kind, signature }) => ({ key, kind, signature })),
    { key: "product:merchant-owned", kind: "product", signature: "external" },
  ];

  const plan = buildProvisionPlan(SHOPIFY_PROVISIONING_MANIFEST, current);

  assert.equal(plan.length, 1);
  assert.equal(plan[0].operation, "UPDATE");
  assert.equal(plan[0].key, first.key);
  assert.ok(plan.every((action) => action.operation !== "DELETE"));
});

test("Admin config chỉ phụ thuộc env và pin API version", () => {
  assert.equal(SHOPIFY_ADMIN_API_VERSION, "2026-07");
  assert.deepEqual(
    resolveAdminConfig({
      SHOPIFY_ADMIN_STORE_DOMAIN: "https://example-shop.myshopify.com/",
      SHOPIFY_ADMIN_ACCESS_TOKEN: "admin-token",
    }),
    {
      apiVersion: "2026-07",
      authMode: "access-token",
      storeDomain: "example-shop.myshopify.com",
      accessToken: "admin-token",
    },
  );
  assert.deepEqual(
    resolveAdminConfig({
      NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "fallback-shop.myshopify.com",
      SHOPIFY_ADMIN_CLIENT_ID: "client-id",
      SHOPIFY_ADMIN_CLIENT_SECRET: "client-secret",
    }),
    {
      apiVersion: "2026-07",
      authMode: "client-credentials",
      storeDomain: "fallback-shop.myshopify.com",
      clientId: "client-id",
      clientSecret: "client-secret",
    },
  );
});

test("Admin client dùng static token đúng endpoint mà không lộ token trong lỗi", async () => {
  const calls = [];
  const client = createAdminClient({
    env: {
      SHOPIFY_ADMIN_STORE_DOMAIN: "example-shop.myshopify.com",
      SHOPIFY_ADMIN_ACCESS_TOKEN: "secret-admin-token",
    },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ data: { shop: { name: "Example" } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  const data = await client.request("query Shop { shop { name } }");

  assert.equal(data.shop.name, "Example");
  assert.equal(calls[0].url, "https://example-shop.myshopify.com/admin/api/2026-07/graphql.json");
  assert.equal(calls[0].init.headers["X-Shopify-Access-Token"], "secret-admin-token");
});

test("Admin client tự lấy client-credentials token và báo GraphQL error có context", async () => {
  const calls = [];
  const client = createAdminClient({
    env: {
      SHOPIFY_ADMIN_STORE_DOMAIN: "example-shop.myshopify.com",
      SHOPIFY_ADMIN_CLIENT_ID: "client-id",
      SHOPIFY_ADMIN_CLIENT_SECRET: "client-secret",
    },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      if (String(url).endsWith("/admin/oauth/access_token")) {
        return new Response(JSON.stringify({ access_token: "ephemeral-token", expires_in: 86399 }));
      }
      return new Response(JSON.stringify({
        errors: [{ message: "Access denied for products field." }],
      }));
    },
  });

  await assert.rejects(
    client.request("query Products { products(first: 1) { nodes { id } } }", {}, {
      operationName: "Products",
    }),
    (error) => {
      assert.match(error.message, /Products/);
      assert.match(error.message, /Access denied/);
      assert.doesNotMatch(error.message, /client-secret|ephemeral-token/);
      return true;
    },
  );
  assert.equal(calls.length, 2);
  assert.match(String(calls[0].url), /admin\/oauth\/access_token$/);
});

test("Admin client read-only chặn mutation có #graphql comment trước operation", async () => {
  let networkCalls = 0;
  const client = createAdminClient({
    env: {
      SHOPIFY_ADMIN_STORE_DOMAIN: "example-shop.myshopify.com",
      SHOPIFY_ADMIN_ACCESS_TOKEN: "secret-admin-token",
    },
    readOnly: true,
    fetchImpl: async () => {
      networkCalls += 1;
      return new Response(JSON.stringify({ data: {} }));
    },
  });

  await assert.rejects(
    client.request(`#graphql
      mutation MustNotRun { metafieldDefinitionDelete(id: "gid://shopify/Test/1") { deletedId } }
    `),
    /blocked in read-only mode/u,
  );
  assert.equal(networkCalls, 0);
});

test("plan và verify giữ read-only boundary, verify báo drift bằng exit code", async () => {
  let applyCalls = 0;
  const lines = [];
  const dependencies = {
    manifest: SHOPIFY_PROVISIONING_MANIFEST,
    loadCurrentResources: async () => [],
    applyProvisionPlan: async () => {
      applyCalls += 1;
    },
    write: (line) => lines.push(line),
  };

  const plan = await runProvisioningCommand({ command: "plan", ...dependencies });
  const verify = await runProvisioningCommand({ command: "verify", ...dependencies });

  assert.equal(plan.exitCode, 0);
  assert.ok(plan.actions.length > 0);
  assert.equal(verify.exitCode, 1);
  assert.ok(verify.actions.length > 0);
  assert.equal(applyCalls, 0);
  assert.ok(lines.some((line) => line.includes("CREATE")));
});

test("apply thực thi plan rồi bắt buộc re-read hội tụ", async () => {
  const converged = compileDesiredResources(SHOPIFY_PROVISIONING_MANIFEST);
  let reads = 0;
  let appliedActions = [];

  const result = await runProvisioningCommand({
    command: "apply",
    manifest: SHOPIFY_PROVISIONING_MANIFEST,
    loadCurrentResources: async () => (reads++ === 0 ? [] : converged),
    applyProvisionPlan: async ({ plan }) => {
      appliedActions = plan;
    },
    write: () => {},
  });

  assert.equal(result.exitCode, 0);
  assert.ok(appliedActions.length > 0);
  assert.equal(result.remainingActions.length, 0);
  assert.equal(reads, 2);
});

test("command từ chối mode không hỗ trợ và apply chưa hội tụ", async () => {
  const dependencies = {
    manifest: SHOPIFY_PROVISIONING_MANIFEST,
    loadCurrentResources: async () => [],
    applyProvisionPlan: async () => {},
    write: () => {},
  };

  await assert.rejects(
    runProvisioningCommand({ command: "remove", ...dependencies }),
    /Unsupported provisioning command/u,
  );
  await assert.rejects(
    runProvisioningCommand({ command: "apply", ...dependencies }),
    /did not converge/u,
  );
});

test("mọi Admin GraphQL document trong operations đều parse được", async () => {
  const source = await readFile(
    new URL("../../scripts/shopify/provision/operations.mjs", import.meta.url),
    "utf8",
  );
  const documents = [...source.matchAll(/`#graphql\n([\s\S]*?)`/gu)].map((match) => match[1]);

  assert.ok(documents.length >= 15);
  for (const document of documents) parse(document);
});

test("store không có Headless publication vẫn được xem là hội tụ ở publication phase", async () => {
  const manifest = {
    locales: ["en", "fr"],
    metafieldDefinitions: [],
    metaobjectDefinitions: [],
    metaobjects: {},
    products: [],
    collections: [],
  };
  const resources = await loadCurrentResources({
    manifest,
    client: {
      request: async () => ({
        shopLocales: [
          { locale: "en", primary: true, published: true },
          { locale: "fr", primary: false, published: true },
        ],
        metaobjectDefinitions: { nodes: [] },
        metafieldDefinitions: { nodes: [] },
        products: { nodes: [] },
        collections: { nodes: [] },
        publications: { nodes: [] },
      }),
    },
  });

  assert.deepEqual(buildProvisionPlan(manifest, resources), []);
});

test("number_decimal so sánh numeric canonical value, field khác so sánh exact", () => {
  assert.equal(shopifyFieldValueMatches("number_decimal", "32.0", "32.00"), true);
  assert.equal(shopifyFieldValueMatches("number_decimal", "32.1", "32.00"), false);
  assert.equal(shopifyFieldValueMatches("number_decimal", "not-a-number", "32.00"), false);
  assert.equal(shopifyFieldValueMatches("single_line_text_field", "32.0", "32.00"), false);
});

test("missing Product metafield được xem là drift thay vì làm plan crash", () => {
  const desired = [{
    key: "species_scientific_name",
    type: "single_line_text_field",
    value: "Huso dauricus",
  }];

  assert.equal(productMetafieldsMatch([], desired), false);
  assert.equal(productMetafieldsMatch([{
    key: "species_scientific_name",
    type: "single_line_text_field",
    value: "Huso dauricus",
  }], desired), true);
});

test("translation fail rõ ràng khi Shopify thiếu desired translatable key", () => {
  assert.deepEqual(
    selectTranslatableValues(
      [{ key: "name", digest: "digest-name" }, { key: "description", digest: "digest-description" }],
      { name: "Premium", description: "Box" },
      "presentation_option:premium:fr",
    ),
    { name: "Premium", description: "Box" },
  );
  assert.throws(
    () => selectTranslatableValues(
      [{ key: "name", digest: "digest-name" }],
      { name: "Premium", description: "Box" },
      "presentation_option:premium:fr",
    ),
    /presentation_option:premium:fr.*description/u,
  );
});

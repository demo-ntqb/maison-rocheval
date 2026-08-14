import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "graphql";

import {
  LEGACY_CAVIAR_SPECIES_TYPE,
  runRemoveCaviarSpecies,
} from "../../scripts/shopify/migrations/remove-caviar-species.mjs";

const legacyDefinition = {
  access: { storefront: "PUBLIC_READ" },
  capabilities: {
    publishable: { enabled: true },
    translatable: { enabled: true },
  },
  displayNameKey: "name",
  id: "gid://shopify/MetaobjectDefinition/123",
  name: "Caviar species",
  type: LEGACY_CAVIAR_SPECIES_TYPE,
  metaobjectsCount: 4,
  fieldDefinitions: [
    { key: "name", name: "Name", required: true, type: { name: "single_line_text_field" } },
    { key: "scientific_name", name: "Scientific name", required: true, type: { name: "single_line_text_field" } },
    { key: "description", name: "Description", required: false, type: { name: "multi_line_text_field" } },
    { key: "grain", name: "Grain", required: false, type: { name: "single_line_text_field" } },
    { key: "colour", name: "Colour", required: false, type: { name: "single_line_text_field" } },
    { key: "taste", name: "Taste", required: false, type: { name: "list.single_line_text_field" } },
  ],
};
const legacyMetaobjects = {
  nodes: ["amur-sturgeon", "kaluga", "kaluga-hybrid", "russian-hybrid"].map((handle) => ({
    id: `gid://shopify/Metaobject/${handle}`,
    handle,
    fields: [{ key: "name", type: "single_line_text_field", value: handle }],
    capabilities: { publishable: { status: "ACTIVE" } },
  })),
  pageInfo: { hasNextPage: false },
};
const readyDefinitions = {
  nodes: [
    {
      access: { storefront: "PUBLIC_READ" },
      key: "species_scientific_name",
      namespace: "rocheval",
      type: { name: "single_line_text_field" },
    },
    {
      access: { storefront: "PUBLIC_READ" },
      key: "species_description",
      namespace: "rocheval",
      type: { name: "multi_line_text_field" },
    },
  ],
};
const readyProducts = {
  nodes: ["amour", "kaluga", "russian-hybrid", "lexpression", "harmonie"].map((handle) => ({
    handle,
    speciesDescription: {
      id: `gid://shopify/Metafield/${handle}-description`,
      value: `${handle} species description`,
    },
    speciesScientificName: {
      id: `gid://shopify/Metafield/${handle}-scientific-name`,
      value: `${handle} scientific name`,
    },
  })),
};

function migrationState(definition = legacyDefinition, overrides = {}) {
  return {
    metaobjectDefinitionByType: definition,
    metaobjects: legacyMetaobjects,
    metafieldDefinitions: readyDefinitions,
    products: readyProducts,
    shopLocales: [
      { locale: "en", primary: true, published: true },
      { locale: "fr", primary: false, published: true },
    ],
    ...overrides,
  };
}

function translatedResource(value = "translated value") {
  return {
    translatableResource: {
      translations: [{ key: "value", value, outdated: false }],
    },
  };
}

function isTranslationQuery(document) {
  return document.includes("ManagedLegacyTranslation");
}

const storeDomain = "example-shop.myshopify.com";
const confirmation = `${storeDomain}:${legacyDefinition.id}`;

test("cleanup GraphQL documents parse được", async () => {
  const source = await readFile(
    new URL("../../scripts/shopify/migrations/remove-caviar-species.mjs", import.meta.url),
    "utf8",
  );
  const documents = [...source.matchAll(/`#graphql\n([\s\S]*?)`/gu)].map((match) => match[1]);

  assert.equal(documents.length, 3);
  for (const document of documents) parse(document);
});

test("cleanup plan chỉ đọc và mô tả đúng legacy definition", async () => {
  const documents = [];
  const lines = [];
  const client = {
    request: async (document) => {
      documents.push(document);
      if (isTranslationQuery(document)) return translatedResource();
      return migrationState();
    },
  };

  const result = await runRemoveCaviarSpecies({
    command: "plan",
    client,
    storeDomain,
    write: (line) => lines.push(line),
  });

  assert.equal(result.operation, "DELETE");
  assert.equal(result.definitionId, legacyDefinition.id);
  assert.ok(documents.every((document) => !document.includes("mutation")));
  assert.ok(lines.some((line) => line.includes("4 metaobject entr")));
  assert.ok(lines.some((line) => line.includes(confirmation)));
  assert.equal(result.confirmation, confirmation);
});

test("cleanup apply xóa đúng definition rồi verify definition đã biến mất", async () => {
  const documents = [];
  const backups = [];
  let reads = 0;
  const client = {
    request: async (document, variables) => {
      documents.push({ document, variables });
      if (document.includes("mutation")) {
        return {
          metaobjectDefinitionDelete: {
            deletedId: legacyDefinition.id,
            userErrors: [],
          },
        };
      }
      if (isTranslationQuery(document)) return translatedResource();
      reads += 1;
      return migrationState(reads === 1 ? legacyDefinition : null);
    },
  };

  const result = await runRemoveCaviarSpecies({
    backupPath: "legacy-backup.json",
    command: "apply",
    client,
    confirmation,
    storeDomain,
    writeBackup: async (path, payload) => backups.push({ path, payload }),
    write: () => {},
  });

  assert.equal(result.operation, "DELETE");
  assert.equal(result.deleted, true);
  assert.equal(backups.length, 1);
  assert.equal(backups[0].path, "legacy-backup.json");
  assert.equal(backups[0].payload.storeDomain, storeDomain);
  assert.deepEqual(
    backups[0].payload.metaobjects.map(({ handle }) => handle),
    legacyMetaobjects.nodes.map(({ handle }) => handle),
  );
  assert.equal(documents.filter(({ document }) => document.includes("mutation")).length, 1);
  assert.deepEqual(
    documents.find(({ document }) => document.includes("mutation")).variables,
    { id: legacyDefinition.id },
  );
});

test("cleanup là no-op khi definition không tồn tại", async () => {
  const result = await runRemoveCaviarSpecies({
    command: "apply",
    client: { request: async () => migrationState(null) },
    storeDomain,
    write: () => {},
  });

  assert.deepEqual(result, { operation: "NONE", deleted: false });
});

test("cleanup từ chối definition cùng type nhưng schema không đúng legacy contract", async () => {
  await assert.rejects(
    runRemoveCaviarSpecies({
      command: "apply",
      confirmation,
      client: {
        request: async () => migrationState({
            ...legacyDefinition,
            fieldDefinitions: [{ key: "merchant_field" }],
          }),
      },
      storeDomain,
      write: () => {},
    }),
    /does not match the expected legacy schema/u,
  );
});

test("cleanup từ chối khi direct Product metafields chưa sẵn sàng", async () => {
  await assert.rejects(
    runRemoveCaviarSpecies({
      command: "apply",
      confirmation,
      client: {
        request: async () => ({
          ...migrationState(),
          products: {
            nodes: readyProducts.nodes.map((product, index) => (
              index === 0 ? { ...product, speciesDescription: null } : product
            )),
          },
        }),
      },
      storeDomain,
      write: () => {},
    }),
    /direct Product species data is not ready/u,
  );
});

test("cleanup từ chối legacy definition có cùng keys nhưng sai field type", async () => {
  await assert.rejects(
    runRemoveCaviarSpecies({
      command: "plan",
      client: {
        request: async () => migrationState({
          ...legacyDefinition,
          fieldDefinitions: legacyDefinition.fieldDefinitions.map((field) => (
            field.key === "taste"
              ? { ...field, type: { name: "single_line_text_field" } }
              : field
          )),
        }),
      },
      storeDomain,
      write: () => {},
    }),
    /does not match the expected legacy schema/u,
  );
});

test("cleanup từ chối khi legacy definition có metaobject ngoài exact legacy set", async () => {
  await assert.rejects(
    runRemoveCaviarSpecies({
      command: "plan",
      client: {
        request: async () => migrationState(legacyDefinition, {
          metaobjects: {
            nodes: [...legacyMetaobjects.nodes, { handle: "merchant-owned" }],
            pageInfo: { hasNextPage: false },
          },
        }),
      },
      storeDomain,
      write: () => {},
    }),
    /legacy metaobject set/u,
  );
});

test("cleanup từ chối khi direct Product metafield thiếu FR translation", async () => {
  await assert.rejects(
    runRemoveCaviarSpecies({
      command: "plan",
      client: {
        request: async (document) => (
          isTranslationQuery(document) ? translatedResource("") : migrationState()
        ),
      },
      storeDomain,
      write: () => {},
    }),
    /translation.*is not ready/u,
  );
});

test("cleanup apply yêu cầu exact store và definition confirmation trước mutation", async () => {
  let mutations = 0;
  await assert.rejects(
    runRemoveCaviarSpecies({
      command: "apply",
      client: {
        request: async (document) => {
          if (document.includes("mutation")) mutations += 1;
          return isTranslationQuery(document) ? translatedResource() : migrationState();
        },
      },
      confirmation: "wrong-confirmation",
      storeDomain,
      write: () => {},
    }),
    /confirmation mismatch/u,
  );
  assert.equal(mutations, 0);
});

test("cleanup apply ghi backup mới thành công trước khi gửi delete mutation", async () => {
  const events = [];
  let reads = 0;
  await runRemoveCaviarSpecies({
    backupPath: "legacy-backup.json",
    command: "apply",
    client: {
      request: async (document) => {
        if (document.includes("mutation")) {
          events.push("delete");
          return {
            metaobjectDefinitionDelete: {
              deletedId: legacyDefinition.id,
              userErrors: [],
            },
          };
        }
        if (isTranslationQuery(document)) return translatedResource();
        reads += 1;
        return migrationState(reads === 1 ? legacyDefinition : null);
      },
    },
    confirmation,
    storeDomain,
    write: () => {},
    writeBackup: async () => events.push("backup"),
  });

  assert.deepEqual(events, ["backup", "delete"]);
});

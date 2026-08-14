#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createAdminClient } from "../provision/admin-client.mjs";
import { loadLocalEnv } from "../provision/env.mjs";

export const LEGACY_CAVIAR_SPECIES_TYPE = "caviar_species";

const EXPECTED_LEGACY_FIELDS = [
  { key: "colour", name: "Colour", required: false, type: "single_line_text_field" },
  { key: "description", name: "Description", required: false, type: "multi_line_text_field" },
  { key: "grain", name: "Grain", required: false, type: "single_line_text_field" },
  { key: "name", name: "Name", required: true, type: "single_line_text_field" },
  { key: "scientific_name", name: "Scientific name", required: true, type: "single_line_text_field" },
  { key: "taste", name: "Taste", required: false, type: "list.single_line_text_field" },
];
const EXPECTED_LEGACY_METAOBJECT_HANDLES = [
  "amur-sturgeon",
  "kaluga",
  "kaluga-hybrid",
  "russian-hybrid",
];
const MANAGED_CAVIAR_HANDLES = [
  "amour",
  "kaluga",
  "russian-hybrid",
  "lexpression",
  "harmonie",
];
const SUPPORTED_COMMANDS = new Set(["plan", "apply"]);
const MANAGED_PRODUCT_QUERY = MANAGED_CAVIAR_HANDLES
  .map((handle) => `handle:${handle}`)
  .join(" OR ");

const LEGACY_DEFINITION_QUERY = `#graphql
  query LegacyCaviarSpeciesDefinition($type: String!, $productQuery: String!) {
    shopLocales {
      locale
      primary
      published
    }
    metaobjectDefinitionByType(type: $type) {
      access { storefront }
      capabilities {
        publishable { enabled }
        translatable { enabled }
      }
      displayNameKey
      id
      name
      type
      metaobjectsCount
      fieldDefinitions {
        key
        name
        required
        type { name }
      }
    }
    metaobjects(first: 100, type: $type) {
      nodes {
        id
        handle
        fields { key type value }
        capabilities { publishable { status } }
      }
      pageInfo { hasNextPage }
    }
    metafieldDefinitions(first: 100, ownerType: PRODUCT, namespace: "rocheval") {
      nodes {
        namespace
        key
        type { name }
        access { storefront }
      }
    }
    products(first: 10, query: $productQuery) {
      nodes {
        handle
        speciesScientificName: metafield(
          namespace: "rocheval"
          key: "species_scientific_name"
        ) { id value }
        speciesDescription: metafield(
          namespace: "rocheval"
          key: "species_description"
        ) { id value }
      }
    }
  }
`;

const LEGACY_TRANSLATION_QUERY = `#graphql
  query ManagedLegacyTranslation($resourceId: ID!, $locale: String!) {
    translatableResource(resourceId: $resourceId) {
      translations(locale: $locale) { key value outdated }
    }
  }
`;

const DELETE_LEGACY_DEFINITION_MUTATION = `#graphql
  mutation DeleteLegacyCaviarSpeciesDefinition($id: ID!) {
    metaobjectDefinitionDelete(id: $id) {
      deletedId
      userErrors { field message code }
    }
  }
`;

function assertExpectedLegacyDefinition(definition) {
  const actualFields = definition.fieldDefinitions.map((field) => ({
    key: field.key,
    name: field.name,
    required: Boolean(field.required),
    type: field.type?.name ?? null,
  })).sort((left, right) => left.key.localeCompare(right.key));
  const expectedFields = [...EXPECTED_LEGACY_FIELDS]
    .sort((left, right) => left.key.localeCompare(right.key));
  const matches = definition.type === LEGACY_CAVIAR_SPECIES_TYPE
    && definition.name === "Caviar species"
    && definition.displayNameKey === "name"
    && definition.access?.storefront === "PUBLIC_READ"
    && definition.capabilities?.publishable?.enabled === true
    && definition.capabilities?.translatable?.enabled === true
    && JSON.stringify(actualFields) === JSON.stringify(expectedFields);
  if (!matches) {
    throw new Error(
      `Definition ${definition.id} does not match the expected legacy schema; refusing deletion.`,
    );
  }
}

function assertExpectedLegacyMetaobjects(definition, metaobjects) {
  const actualHandles = metaobjects.nodes.map(({ handle }) => handle).sort();
  const expectedHandles = [...EXPECTED_LEGACY_METAOBJECT_HANDLES].sort();
  const matches = metaobjects.pageInfo?.hasNextPage === false
    && definition.metaobjectsCount === expectedHandles.length
    && JSON.stringify(actualHandles) === JSON.stringify(expectedHandles);
  if (!matches) {
    throw new Error(
      `Definition ${definition.id} does not contain the exact legacy metaobject set; refusing deletion.`,
    );
  }
}

function assertDirectProductDataReady(state) {
  const definitions = new Map(
    state.metafieldDefinitions.nodes
      .filter(({ namespace }) => namespace === "rocheval")
      .map((definition) => [definition.key, definition]),
  );
  const scientificName = definitions.get("species_scientific_name");
  const description = definitions.get("species_description");
  const definitionsReady = scientificName?.type.name === "single_line_text_field"
    && scientificName.access.storefront === "PUBLIC_READ"
    && description?.type.name === "multi_line_text_field"
    && description.access.storefront === "PUBLIC_READ";

  const products = new Map(state.products.nodes.map((product) => [product.handle, product]));
  const productsReady = MANAGED_CAVIAR_HANDLES.every((handle) => {
    const product = products.get(handle);
    return Boolean(
      product?.speciesScientificName?.id
      && product.speciesScientificName.value?.trim()
      && product.speciesDescription?.id
      && product.speciesDescription.value?.trim(),
    );
  });

  if (!definitionsReady || !productsReady) {
    throw new Error(
      "Legacy cleanup blocked: direct Product species data is not ready for every managed caviar product.",
    );
  }
}

async function assertDirectProductTranslationsReady(client, state) {
  const locales = new Map(
    state.shopLocales.map((locale) => [locale.locale.toLowerCase(), locale]),
  );
  const primaryLocale = state.shopLocales.find(({ primary }) => primary)?.locale?.toLowerCase();
  const requiredLocales = ["en", "fr"];
  if (!requiredLocales.includes(primaryLocale)
    || !requiredLocales.every((locale) => locales.get(locale)?.published)) {
    throw new Error("Legacy cleanup blocked: published EN/FR Shopify locales are required.");
  }

  const translatedLocales = requiredLocales.filter((locale) => locale !== primaryLocale);
  for (const product of state.products.nodes) {
    const metafields = [
      ["species_scientific_name", product.speciesScientificName],
      ["species_description", product.speciesDescription],
    ];
    for (const [key, metafield] of metafields) {
      for (const locale of translatedLocales) {
        const data = await client.request(
          LEGACY_TRANSLATION_QUERY,
          { resourceId: metafield.id, locale },
          { operationName: "ManagedLegacyTranslation" },
        );
        const translation = data.translatableResource?.translations?.find(
          (candidate) => candidate.key === "value",
        );
        if (!translation?.value?.trim() || translation.outdated) {
          throw new Error(
            `Legacy cleanup blocked: ${product.handle}:rocheval.${key}:${locale} translation is not ready.`,
          );
        }
      }
    }
  }
}

async function buildLegacyBackup(client, state, storeDomain) {
  const primaryLocale = state.shopLocales.find(({ primary }) => primary).locale.toLowerCase();
  const translatedLocales = ["en", "fr"].filter((locale) => locale !== primaryLocale);
  const metaobjects = [];

  for (const metaobject of state.metaobjects.nodes) {
    const translations = {};
    for (const locale of translatedLocales) {
      const data = await client.request(
        LEGACY_TRANSLATION_QUERY,
        { resourceId: metaobject.id, locale },
        { operationName: "ManagedLegacyTranslation" },
      );
      translations[locale] = data.translatableResource?.translations ?? [];
    }
    metaobjects.push({ ...metaobject, translations });
  }

  return {
    version: 1,
    storeDomain,
    definition: state.metaobjectDefinitionByType,
    metaobjects,
  };
}

async function writeBackupFile(path, payload) {
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, { flag: "wx" });
}

function expectedConfirmation(storeDomain, definitionId) {
  if (!storeDomain) {
    throw new Error("Legacy cleanup requires the resolved Shopify store domain.");
  }
  return `${storeDomain}:${definitionId}`;
}

async function readMigrationState(client) {
  return client.request(
    LEGACY_DEFINITION_QUERY,
    {
      productQuery: MANAGED_PRODUCT_QUERY,
      type: LEGACY_CAVIAR_SPECIES_TYPE,
    },
    { operationName: "LegacyCaviarSpeciesDefinition" },
  );
}

async function deleteLegacyDefinition(client, definitionId) {
  const data = await client.request(
    DELETE_LEGACY_DEFINITION_MUTATION,
    { id: definitionId },
    { operationName: "DeleteLegacyCaviarSpeciesDefinition" },
  );
  const payload = data.metaobjectDefinitionDelete;
  if (payload.userErrors?.length) {
    const details = payload.userErrors.map(({ message }) => message).join("; ");
    throw new Error(`Failed to delete ${LEGACY_CAVIAR_SPECIES_TYPE}: ${details}`);
  }
  if (payload.deletedId !== definitionId) {
    throw new Error(`Shopify did not confirm deletion of ${definitionId}.`);
  }
}

export async function runRemoveCaviarSpecies({
  command,
  client,
  backupPath,
  confirmation,
  storeDomain = client.storeDomain,
  writeBackup = writeBackupFile,
  write,
}) {
  if (!SUPPORTED_COMMANDS.has(command)) {
    throw new Error(`Unsupported cleanup command: ${String(command)}. Use plan or apply.`);
  }

  const state = await readMigrationState(client);
  const definition = state.metaobjectDefinitionByType;
  if (!definition) {
    write(`Legacy ${LEGACY_CAVIAR_SPECIES_TYPE} definition is already absent.\n`);
    return { operation: "NONE", deleted: false };
  }

  assertExpectedLegacyDefinition(definition);
  assertExpectedLegacyMetaobjects(definition, state.metaobjects);
  assertDirectProductDataReady(state);
  await assertDirectProductTranslationsReady(client, state);
  const requiredConfirmation = expectedConfirmation(storeDomain, definition.id);
  write(
    `DELETE ${definition.type} definition ${definition.id} and ${definition.metaobjectsCount} metaobject entries.\n`,
  );
  write(`Required confirmation: ${requiredConfirmation}\n`);

  if (command === "plan") {
    return {
      operation: "DELETE",
      definitionId: definition.id,
      confirmation: requiredConfirmation,
      deleted: false,
    };
  }
  if (confirmation !== requiredConfirmation) {
    throw new Error(
      `Legacy cleanup confirmation mismatch. Re-run with --confirm=${requiredConfirmation}`,
    );
  }
  if (!backupPath) {
    throw new Error("Legacy cleanup apply requires --backup=<new-json-file>.");
  }

  const backup = await buildLegacyBackup(client, state, storeDomain);
  await writeBackup(backupPath, backup);
  write(`Wrote legacy backup to ${backupPath}.\n`);

  await deleteLegacyDefinition(client, definition.id);
  const remaining = await readMigrationState(client);
  if (remaining.metaobjectDefinitionByType) {
    throw new Error(`Cleanup did not converge: ${LEGACY_CAVIAR_SPECIES_TYPE} still exists.`);
  }

  write(`Deleted legacy ${LEGACY_CAVIAR_SPECIES_TYPE} definition.\n`);
  return { operation: "DELETE", definitionId: definition.id, deleted: true };
}

async function main() {
  const command = process.argv[2] ?? "plan";
  const confirmation = process.argv
    .slice(3)
    .find((argument) => argument.startsWith("--confirm="))
    ?.slice("--confirm=".length);
  const backupPath = process.argv
    .slice(3)
    .find((argument) => argument.startsWith("--backup="))
    ?.slice("--backup=".length);
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const env = await loadLocalEnv(repoRoot);
  const client = createAdminClient({ env, readOnly: command !== "apply" });
  await runRemoveCaviarSpecies({
    command,
    backupPath,
    client,
    confirmation,
    write: (line) => process.stdout.write(line),
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

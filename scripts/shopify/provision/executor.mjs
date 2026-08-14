import { resolve } from "node:path";

import {
  addProductMedia,
  publishResources,
  productTextMetafieldValues,
  reorderCollectionProducts,
  registerTranslations,
  setProductMetafields,
  upsertCollection,
  upsertMetafieldDefinition,
  upsertMetaobject,
  upsertMetaobjectDefinition,
  upsertProduct,
  serializeFieldValue,
  waitForJob,
} from "./operations.mjs";
import { discoverSnapshot } from "./state.mjs";
import { metaobjectTranslationContent } from "./translations.mjs";
import { createLocalImageUploader } from "./uploader.mjs";

function actionKeys(plan, kind) {
  return new Set(plan.filter((action) => action.kind === kind).map(({ key }) => key));
}

function actionLabel(action) {
  return `${action.operation} ${action.key}`;
}

function mergeProduct(registry, handle, update) {
  const current = registry.products.get(handle) ?? {};
  registry.products.set(handle, {
    ...current,
    ...update,
    metafields: update.metafields ?? current.metafields ?? { nodes: [] },
    media: update.media ?? current.media ?? { nodes: [] },
  });
}

async function applyDefinitions(client, manifest, registry, plan, write) {
  const metaobjectKeys = actionKeys(plan, "metaobject-definition");
  for (const definition of manifest.metaobjectDefinitions) {
    const key = `metaobject-definition:${definition.type}`;
    if (!metaobjectKeys.has(key)) continue;
    write(`Applying ${key}\n`);
    const result = await upsertMetaobjectDefinition(
      client,
      definition,
      registry.metaobjectDefinitions.get(definition.type),
    );
    registry.metaobjectDefinitions.set(definition.type, {
      ...registry.metaobjectDefinitions.get(definition.type),
      ...result,
      fieldDefinitions: definition.fields.map((field) => ({
        ...field,
        type: { name: field.type },
      })),
    });
  }

  const metafieldKeys = actionKeys(plan, "metafield-definition");
  for (const definition of manifest.metafieldDefinitions) {
    const key = `metafield-definition:PRODUCT:${definition.namespace}.${definition.key}`;
    if (!metafieldKeys.has(key)) continue;
    write(`Applying ${key}\n`);
    const referenceDefinitionId = definition.referenceType
      ? registry.metaobjectDefinitions.get(definition.referenceType)?.id
      : undefined;
    if (definition.referenceType && !referenceDefinitionId) {
      throw new Error(`Metaobject definition ${definition.referenceType} is unavailable.`);
    }
    const desired = { ...definition, referenceDefinitionId };
    const current = registry.metafieldDefinitions.get(`${definition.namespace}.${definition.key}`);
    if (current && current.type.name !== definition.type) {
      throw new Error(
        `Cannot change type of existing ${definition.namespace}.${definition.key} from ${current.type.name} to ${definition.type}.`,
      );
    }
    const result = await upsertMetafieldDefinition(client, desired, current);
    registry.metafieldDefinitions.set(`${definition.namespace}.${definition.key}`, {
      ...current,
      ...result,
      type: { name: definition.type },
    });
  }
}

async function applyMetaobjects(client, manifest, registry, plan, write) {
  const keys = actionKeys(plan, "metaobject");
  for (const entry of Object.values(manifest.metaobjects).flat()) {
    const key = `metaobject:${entry.type}:${entry.handle}`;
    if (!keys.has(key)) continue;
    write(`Applying ${key}\n`);
    const result = await upsertMetaobject(client, entry, registry.baseLocale);
    registry.metaobjects.set(`${entry.type}:${entry.handle}`, {
      ...registry.metaobjects.get(`${entry.type}:${entry.handle}`),
      ...result,
      fields: Object.entries({
        ...entry.content[registry.baseLocale],
        ...(entry.price ? { price: entry.price } : {}),
      }).map(([fieldKey, value]) => ({
        key: fieldKey,
        value: serializeFieldValue(value),
      })),
      capabilities: { publishable: { status: "ACTIVE" } },
    });
  }
}

async function applyProducts(client, manifest, registry, plan, write) {
  const keys = actionKeys(plan, "product");
  for (const product of manifest.products) {
    const key = `product:${product.handle}`;
    if (!keys.has(key)) continue;
    write(`Applying ${key}\n`);
    const result = await upsertProduct(
      client,
      product,
      registry.baseLocale,
      registry.products.get(product.handle),
    );
    mergeProduct(registry, product.handle, result);
  }
}

async function applyProductContent(client, manifest, registry, plan, uploadLocalImage, write) {
  const keys = actionKeys(plan, "product-content");
  for (const product of manifest.products) {
    const key = `product-content:${product.handle}`;
    if (!keys.has(key)) continue;
    write(`Applying ${key}\n`);
    const metafields = await setProductMetafields(client, product, registry.baseLocale, {
      products: registry.products,
      metaobjects: registry.metaobjects,
      metafieldDefinitions: [...registry.metafieldDefinitions.values()],
    });
    if (metafields.length > 0) {
      mergeProduct(registry, product.handle, { metafields: { nodes: metafields } });
    }
    await addProductMedia(client, product, registry, uploadLocalImage);
  }
}

async function applyCollections(client, manifest, registry, plan, write) {
  const keys = actionKeys(plan, "collection");
  for (const collection of manifest.collections) {
    const key = `collection:${collection.handle}`;
    if (!keys.has(key)) continue;
    write(`Applying ${key}\n`);
    const productIds = collection.products.map((handle) => {
      const product = registry.products.get(handle);
      if (!product) throw new Error(`Product ${handle} is unavailable for ${collection.handle}.`);
      return product.id;
    });
    const result = await upsertCollection(
      client,
      collection,
      registry.baseLocale,
      registry.collections.get(collection.handle),
      productIds,
    );
    await waitForJob(client, result.jobId);
    await reorderCollectionProducts(client, result.collection.id, productIds);
    registry.collections.set(collection.handle, {
      ...registry.collections.get(collection.handle),
      ...result.collection,
    });
  }
}

async function translateProduct(client, product, registry, locale) {
  const actual = registry.products.get(product.handle);
  await registerTranslations(client, actual.id, locale, {
    title: product.content[locale].title,
    body_html: product.content[locale].descriptionHtml,
  });
  if (product.kind !== "caviar") return;

  const fields = new Map(actual.metafields.nodes.map((field) => [field.key, field]));
  const translatedFields = productTextMetafieldValues(product, locale);
  for (const [key, value] of Object.entries(translatedFields)) {
    const metafield = fields.get(key);
    if (!metafield?.id) throw new Error(`Metafield ${product.handle}:rocheval.${key} is unavailable.`);
    await registerTranslations(client, metafield.id, locale, { value });
  }
}

async function applyLocalizations(client, manifest, registry, plan, write) {
  const keys = actionKeys(plan, "localization");
  for (const locale of manifest.locales) {
    const key = `localization:${locale}`;
    if (!keys.has(key)) continue;
    if (locale === registry.baseLocale) {
      write(`Applying ${key} via base-resource updates\n`);
      continue;
    }
    write(`Applying ${key}\n`);
    for (const product of manifest.products) {
      await translateProduct(client, product, registry, locale);
    }
    for (const collection of manifest.collections) {
      await registerTranslations(client, registry.collections.get(collection.handle).id, locale, {
        title: collection.content[locale].title,
        body_html: collection.content[locale].descriptionHtml,
      });
    }
    for (const entry of Object.values(manifest.metaobjects).flat()) {
      const actual = registry.metaobjects.get(`${entry.type}:${entry.handle}`);
      const definition = manifest.metaobjectDefinitions.find(({ type }) => type === entry.type);
      const values = Object.fromEntries(
        Object.entries(metaobjectTranslationContent(entry, definition, locale)).map(([fieldKey, value]) => (
          [fieldKey, serializeFieldValue(value)]
        )),
      );
      await registerTranslations(client, actual.id, locale, values);
    }
  }
}

async function applyPublication(client, manifest, registry, plan, write) {
  if (!plan.some(({ kind }) => kind === "publication")) return;
  if (!registry.publication) {
    write("Skipping publication: no Headless publication exists in the target store.\n");
    return;
  }
  write("Applying publication:headless\n");
  const ids = [
    ...manifest.products.map(({ handle }) => registry.products.get(handle).id),
    ...manifest.collections.map(({ handle }) => registry.collections.get(handle).id),
  ];
  await publishResources(client, registry.publication.id, ids);
}

export async function applyProvisionPlan({
  client,
  manifest,
  plan,
  repoRoot = resolve(import.meta.dirname, "../../../"),
  fetchImpl = fetch,
  write = (line) => process.stdout.write(line),
}) {
  if (plan.some(({ operation }) => !["CREATE", "UPDATE"].includes(operation))) {
    throw new Error(`Provision plan contains an unsupported operation: ${actionLabel(
      plan.find(({ operation }) => !["CREATE", "UPDATE"].includes(operation)),
    )}`);
  }

  const registry = await discoverSnapshot(client, manifest);
  const uploadLocalImage = createLocalImageUploader({ client, repoRoot, fetchImpl });
  await applyDefinitions(client, manifest, registry, plan, write);
  await applyMetaobjects(client, manifest, registry, plan, write);
  await applyProducts(client, manifest, registry, plan, write);
  await applyProductContent(client, manifest, registry, plan, uploadLocalImage, write);
  await applyCollections(client, manifest, registry, plan, write);
  await applyLocalizations(client, manifest, registry, plan, write);
  await applyPublication(client, manifest, registry, plan, write);
}

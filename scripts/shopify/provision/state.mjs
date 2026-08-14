import {
  DISCOVER_STATE_QUERY,
  METAOBJECTS_BY_TYPE_QUERY,
  PUBLICATION_STATUS_QUERY,
  TRANSLATABLE_RESOURCE_QUERY,
  productMetafieldInputs,
  productTextMetafieldValues,
  selectTranslatableValues,
  serializeFieldValue,
} from "./operations.mjs";
import { compileDesiredResources, resourceSignature } from "./planner.mjs";
import { metaobjectTranslationContent } from "./translations.mjs";

function by(items, key) {
  return new Map(items.map((item) => [key(item), item]));
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function actualSignature(key, value) {
  return resourceSignature({ key, actual: value ?? null });
}

function requireSupportedPrimaryLocale(locales, manifest) {
  const primary = locales.find(({ primary }) => primary)?.locale?.toLowerCase();
  if (!primary || !manifest.locales.includes(primary)) {
    throw new Error(
      `Shopify primary locale must be one of ${manifest.locales.join(", ")}; received ${primary || "none"}.`,
    );
  }
  return primary;
}

function definitionMatches(desired, actual) {
  if (!actual) return false;
  const fields = actual.fieldDefinitions.map((field) => ({
    key: field.key,
    name: field.name,
    type: field.type.name,
    required: field.required,
  }));
  return actual.name === desired.name
    && actual.displayNameKey === desired.displayNameKey
    && actual.access?.storefront === "PUBLIC_READ"
    && actual.capabilities?.publishable?.enabled === true
    && actual.capabilities?.translatable?.enabled === true
    && desired.fields.every((field) => fields.some((candidate) => same(candidate, {
      key: field.key,
      name: field.name,
      type: field.type,
      required: Boolean(field.required),
    })));
}

export function metafieldDefinitionMatches(desired, actual) {
  return Boolean(actual)
    && actual.name === desired.name
    && (!desired.description || actual.description === desired.description)
    && actual.type?.name === desired.type
    && actual.access?.storefront === "PUBLIC_READ"
    && (!desired.pin || actual.pinnedPosition != null);
}

function metaobjectFields(entry, baseLocale) {
  return Object.entries({
    ...entry.content[baseLocale],
    ...(entry.price ? { price: entry.price } : {}),
  }).map(([key, value]) => [key, serializeFieldValue(value)]);
}

export function shopifyFieldValueMatches(type, actual, desired) {
  if (type === "number_decimal") {
    const actualNumber = Number(actual);
    const desiredNumber = Number(desired);
    return Number.isFinite(actualNumber)
      && Number.isFinite(desiredNumber)
      && actualNumber === desiredNumber;
  }
  return actual === desired;
}

function metaobjectMatches(entry, actual, baseLocale) {
  if (!actual || actual.capabilities?.publishable?.status !== "ACTIVE") return false;
  const fields = new Map(actual.fields.map((field) => [field.key, field]));
  return metaobjectFields(entry, baseLocale).every(([key, value]) => {
    const field = fields.get(key);
    return Boolean(field) && shopifyFieldValueMatches(field.type, field.value, value);
  });
}

export function managedProductFieldsMatch(product, actual, baseLocale) {
  if (!actual) return false;
  const desiredContent = product.content[baseLocale];
  return actual.title === desiredContent.title
    && actual.descriptionHtml === desiredContent.descriptionHtml
    && actual.productType === product.productType
    && actual.vendor === "Maison Rocheval"
    && actual.status === "ACTIVE";
}

export function productMetafieldsMatch(currentFields, desiredFields) {
  const current = new Map(currentFields.map((field) => [field.key, field]));
  return desiredFields.every((field) => {
    const candidate = current.get(field.key);
    return candidate?.type === field.type && candidate?.value === field.value;
  });
}

function productContentMatches(product, actual, baseLocale, registry) {
  if (!actual) return false;
  if (product.kind === "caviar") {
    const desired = productMetafieldInputs(product, baseLocale, registry);
    if (!productMetafieldsMatch(actual.metafields.nodes, desired)) return false;
  }
  const filename = product.image.path.split("/").at(-1);
  return actual.media.nodes.some((media) => (
    media.image?.url?.split("?")[0].endsWith(`/${filename}`) || media.alt === product.image.alt.en
  ));
}

function collectionMatches(collection, actual, baseLocale) {
  if (!actual) return false;
  const content = collection.content[baseLocale];
  const currentHandles = actual.products.nodes.map(({ handle }) => handle);
  const desiredPositions = collection.products.map((handle) => currentHandles.indexOf(handle));
  return actual.title === content.title
    && actual.descriptionHtml === content.descriptionHtml
    && actual.sortOrder === "MANUAL"
    && desiredPositions.every((position) => position >= 0)
    && desiredPositions.every((position, index) => index === 0 || position > desiredPositions[index - 1]);
}

async function readTranslations(client, resourceId, locale) {
  const data = await client.request(TRANSLATABLE_RESOURCE_QUERY, { resourceId, locale });
  return data.translatableResource ?? null;
}

function translationsMatch(resource, desired, context) {
  if (!resource) return false;
  const actual = new Map(
    resource.translations.map(({ key, value, outdated }) => [key, { value, outdated }]),
  );
  const supportedValues = selectTranslatableValues(
    resource.translatableContent,
    desired,
    context,
  );
  return Object.entries(supportedValues).every(([key, value]) => {
    const candidate = actual.get(key);
    return candidate?.value === value && !candidate.outdated;
  });
}

function baseLocaleMatches(manifest, snapshot) {
  const { baseLocale } = snapshot;
  return manifest.products.every((product) => managedProductFieldsMatch(
    product,
    snapshot.products.get(product.handle),
    baseLocale,
  )) && manifest.collections.every((collection) => collectionMatches(
    collection,
    snapshot.collections.get(collection.handle),
    baseLocale,
  )) && Object.values(manifest.metaobjects).flat().every((entry) => metaobjectMatches(
    entry,
    snapshot.metaobjects.get(`${entry.type}:${entry.handle}`),
    baseLocale,
  ));
}

async function localeMatches(manifest, snapshot, locale) {
  if (locale === snapshot.baseLocale) return baseLocaleMatches(manifest, snapshot);

  for (const product of manifest.products) {
    const actual = snapshot.products.get(product.handle);
    if (!actual) return false;
    const translations = await readTranslations(snapshot.client, actual.id, locale);
    if (!translationsMatch(translations, {
      title: product.content[locale].title,
      body_html: product.content[locale].descriptionHtml,
    }, `product:${product.handle}:${locale}`)) return false;

    if (product.kind === "caviar") {
      const fields = new Map(actual.metafields.nodes.map(({ key, ...field }) => [key, field]));
      const desiredFields = productTextMetafieldValues(product, locale);
      for (const [key, value] of Object.entries(desiredFields)) {
        const field = fields.get(key);
        if (!field) return false;
        const fieldTranslations = await readTranslations(snapshot.client, field.id, locale);
        if (!translationsMatch(
          fieldTranslations,
          { value },
          `product:${product.handle}:rocheval.${key}:${locale}`,
        )) return false;
      }
    }
  }

  for (const collection of manifest.collections) {
    const actual = snapshot.collections.get(collection.handle);
    if (!actual) return false;
    const translations = await readTranslations(snapshot.client, actual.id, locale);
    if (!translationsMatch(translations, {
      title: collection.content[locale].title,
      body_html: collection.content[locale].descriptionHtml,
    }, `collection:${collection.handle}:${locale}`)) return false;
  }

  for (const entry of Object.values(manifest.metaobjects).flat()) {
    const actual = snapshot.metaobjects.get(`${entry.type}:${entry.handle}`);
    if (!actual) return false;
    const translations = await readTranslations(snapshot.client, actual.id, locale);
    const definition = manifest.metaobjectDefinitions.find(({ type }) => type === entry.type);
    const desired = Object.fromEntries(Object.entries(
      metaobjectTranslationContent(entry, definition, locale),
    ).map(([key, value]) => [key, serializeFieldValue(value)]));
    if (!translationsMatch(
      translations,
      desired,
      `metaobject:${entry.type}:${entry.handle}:${locale}`,
    )) return false;
  }
  return true;
}

async function discoverSnapshot(client, manifest) {
  const productQuery = manifest.products.map(({ handle }) => `handle:${handle}`).join(" OR ") || "id:0";
  const collectionQuery = manifest.collections.map(({ handle }) => `handle:${handle}`).join(" OR ") || "id:0";
  const data = await client.request(DISCOVER_STATE_QUERY, {
    productQuery,
    collectionQuery,
  }, { operationName: "ProvisioningState" });
  const baseLocale = requireSupportedPrimaryLocale(data.shopLocales, manifest);
  const metaobjects = [];
  for (const definition of manifest.metaobjectDefinitions) {
    const response = await client.request(
      METAOBJECTS_BY_TYPE_QUERY,
      { type: definition.type },
      { operationName: "ManagedMetaobjects" },
    );
    metaobjects.push(...response.metaobjects.nodes);
  }

  const products = by(data.products.nodes, ({ handle }) => handle);
  const collections = by(data.collections.nodes, ({ handle }) => handle);
  const publication = data.publications.nodes.find(({ name }) => /headless/iu.test(name));
  const publishableIds = [
    ...manifest.products.map(({ handle }) => products.get(handle)?.id),
    ...manifest.collections.map(({ handle }) => collections.get(handle)?.id),
  ].filter(Boolean);
  let publicationStatus = new Map();
  if (publication && publishableIds.length > 0) {
    const response = await client.request(PUBLICATION_STATUS_QUERY, {
      publicationId: publication.id,
      ids: publishableIds,
    }, { operationName: "ManagedPublicationStatus" });
    publicationStatus = by(response.nodes.filter(Boolean), ({ id }) => id);
  }

  return {
    client,
    baseLocale,
    locales: data.shopLocales,
    metaobjectDefinitions: by(data.metaobjectDefinitions.nodes, ({ type }) => type),
    metafieldDefinitions: by(
      data.metafieldDefinitions.nodes,
      ({ namespace, key }) => `${namespace}.${key}`,
    ),
    metaobjects: by(metaobjects, ({ type, handle }) => `${type}:${handle}`),
    products,
    collections,
    publication,
    publicationStatus,
  };
}

function resourceExists(resource, snapshot) {
  if (resource.kind === "metaobject-definition") {
    return snapshot.metaobjectDefinitions.has(resource.data.type);
  }
  if (resource.kind === "metafield-definition") {
    return snapshot.metafieldDefinitions.has(`${resource.data.namespace}.${resource.data.key}`);
  }
  if (resource.kind === "metaobject") {
    return snapshot.metaobjects.has(`${resource.data.type}:${resource.data.handle}`);
  }
  if (resource.kind === "product" || resource.kind === "product-content") {
    return snapshot.products.has(resource.data.handle);
  }
  if (resource.kind === "collection") return snapshot.collections.has(resource.data.handle);
  if (resource.kind === "localization") return true;
  if (resource.kind === "publication") return true;
  return false;
}

async function resourceMatches(resource, manifest, snapshot) {
  if (resource.kind === "metaobject-definition") {
    return definitionMatches(resource.data, snapshot.metaobjectDefinitions.get(resource.data.type));
  }
  if (resource.kind === "metafield-definition") {
    return metafieldDefinitionMatches(
      resource.data,
      snapshot.metafieldDefinitions.get(`${resource.data.namespace}.${resource.data.key}`),
    );
  }
  if (resource.kind === "metaobject") {
    return metaobjectMatches(
      resource.data,
      snapshot.metaobjects.get(`${resource.data.type}:${resource.data.handle}`),
      snapshot.baseLocale,
    );
  }
  if (resource.kind === "product") {
    const product = manifest.products.find(({ handle }) => handle === resource.data.handle);
    return managedProductFieldsMatch(
      product,
      snapshot.products.get(product.handle),
      snapshot.baseLocale,
    );
  }
  if (resource.kind === "product-content") {
    const product = manifest.products.find(({ handle }) => handle === resource.data.handle);
    const registry = {
      products: snapshot.products,
      metaobjects: snapshot.metaobjects,
      metafieldDefinitions: [...snapshot.metafieldDefinitions.values()],
    };
    return productContentMatches(product, snapshot.products.get(product.handle), snapshot.baseLocale, registry);
  }
  if (resource.kind === "collection") {
    return collectionMatches(resource.data, snapshot.collections.get(resource.data.handle), snapshot.baseLocale);
  }
  if (resource.kind === "localization") {
    return localeMatches(manifest, snapshot, resource.data.locale);
  }
  if (resource.kind === "publication") {
    if (!snapshot.publication) return true;
    const ids = [
      ...manifest.products.map(({ handle }) => snapshot.products.get(handle)?.id),
      ...manifest.collections.map(({ handle }) => snapshot.collections.get(handle)?.id),
    ];
    return ids.every((id) => id && snapshot.publicationStatus.get(id)?.publishedOnPublication);
  }
  return false;
}

export async function loadCurrentResources({ client, manifest }) {
  const snapshot = await discoverSnapshot(client, manifest);
  const resources = [];
  for (const desired of compileDesiredResources(manifest)) {
    if (!resourceExists(desired, snapshot)) continue;
    const matches = await resourceMatches(desired, manifest, snapshot);
    resources.push({
      key: desired.key,
      kind: desired.kind,
      signature: matches ? desired.signature : actualSignature(desired.key, { drift: true }),
    });
  }
  return resources;
}

export { discoverSnapshot };

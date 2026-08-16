export const DISCOVER_STATE_QUERY = `#graphql
  query ProvisioningState($productQuery: String!, $collectionQuery: String!) {
    shopLocales {
      locale
      primary
      published
    }
    metaobjectDefinitions(first: 100) {
      nodes {
        id
        type
        name
        displayNameKey
        access { admin storefront }
        capabilities {
          publishable { enabled }
          translatable { enabled }
        }
        fieldDefinitions {
          key
          name
          required
          type { name }
          validations { name value }
        }
      }
    }
    metafieldDefinitions(first: 100, ownerType: PRODUCT, namespace: "rocheval") {
      nodes {
        id
        namespace
        key
        name
        description
        pinnedPosition
        type { name }
        access { admin storefront }
        validations { name value }
      }
    }
    products(first: 100, query: $productQuery) {
      nodes {
        id
        handle
        title
        descriptionHtml
        productType
        vendor
        status
        metafields(first: 50, namespace: "rocheval") {
          nodes { id namespace key type value }
        }
        media(first: 50) {
          nodes {
            id
            alt
            mediaContentType
            ... on MediaImage { image { url } }
          }
        }
      }
    }
    collections(first: 100, query: $collectionQuery) {
      nodes {
        id
        handle
        title
        descriptionHtml
        sortOrder
        products(first: 100) { nodes { id handle } }
      }
    }
    publications(first: 50) {
      nodes { id name }
    }
  }
`;

export const METAOBJECTS_BY_TYPE_QUERY = `#graphql
  query ManagedMetaobjects($type: String!) {
    metaobjects(first: 100, type: $type) {
      nodes {
        id
        type
        handle
        fields { key type value }
        capabilities { publishable { status } }
      }
    }
  }
`;

export const TRANSLATABLE_RESOURCE_QUERY = `#graphql
  query ManagedTranslations($resourceId: ID!, $locale: String!) {
    translatableResource(resourceId: $resourceId) {
      resourceId
      translatableContent { key value digest locale }
      translations(locale: $locale) { key value outdated }
    }
  }
`;

export const PUBLICATION_STATUS_QUERY = `#graphql
  query ManagedPublicationStatus($publicationId: ID!, $ids: [ID!]!) {
    nodes(ids: $ids) {
      id
      ... on Product { handle publishedOnPublication(publicationId: $publicationId) }
      ... on Collection { handle publishedOnPublication(publicationId: $publicationId) }
    }
  }
`;

function formatUserErrors(errors) {
  return errors
    .map(({ field, message, code }) => {
      const at = Array.isArray(field) && field.length > 0 ? ` at ${field.join(".")}` : "";
      const suffix = code ? ` (${code})` : "";
      return `${message}${at}${suffix}`;
    })
    .join("; ");
}

export function mutationPayload(data, field, context) {
  const payload = data?.[field];
  if (!payload) throw new Error(`[shopify-admin] ${context} response is missing ${field}.`);
  if (payload.userErrors?.length) {
    throw new Error(`[shopify-admin] ${context} failed: ${formatUserErrors(payload.userErrors)}`);
  }
  return payload;
}

export async function upsertMetaobjectDefinition(client, definition, current) {
  const access = { storefront: "PUBLIC_READ" };
  const capabilities = { publishable: { enabled: true }, translatable: { enabled: true } };
  const fields = definition.fields.map((field) => ({
    key: field.key,
    name: field.name,
    type: field.type,
    required: Boolean(field.required),
  }));

  if (!current) {
    const data = await client.request(`#graphql
      mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition { id type }
          userErrors { field message }
        }
      }
    `, {
      definition: {
        type: definition.type,
        name: definition.name,
        displayNameKey: definition.displayNameKey,
        access,
        capabilities,
        fieldDefinitions: fields,
      },
    });
    return mutationPayload(data, "metaobjectDefinitionCreate", definition.type).metaobjectDefinition;
  }

  const existingByKey = new Map(current.fieldDefinitions.map((field) => [field.key, field]));
  const fieldDefinitions = fields.map((field) => {
    const existing = existingByKey.get(field.key);
    if (!existing) return { create: field };
    if (existing.type.name !== field.type) {
      throw new Error(
        `Cannot change type of ${definition.type}.${field.key} from ${existing.type.name} to ${field.type}.`,
      );
    }
    return {
      update: {
        key: field.key,
        name: field.name,
        required: field.required,
      },
    };
  });
  const data = await client.request(`#graphql
    mutation UpdateMetaobjectDefinition($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
      metaobjectDefinitionUpdate(id: $id, definition: $definition) {
        metaobjectDefinition { id type }
        userErrors { field message }
      }
    }
  `, {
    id: current.id,
    definition: {
      name: definition.name,
      displayNameKey: definition.displayNameKey,
      access,
      capabilities,
      fieldDefinitions,
    },
  });
  return mutationPayload(data, "metaobjectDefinitionUpdate", definition.type).metaobjectDefinition;
}

export async function deleteMetafieldDefinition(client, id) {
  const data = await client.request(`#graphql
    mutation DeleteMetafieldDefinition($id: ID!) {
      metafieldDefinitionDelete(id: $id, deleteAllAssociatedMetafields: true) {
        deletedDefinitionId
        userErrors { field message }
      }
    }
  `, { id });
  return mutationPayload(data, "metafieldDefinitionDelete", id);
}

export async function upsertMetafieldDefinition(client, definition, current) {
  const access = { storefront: "PUBLIC_READ" };
  const validations = definition.referenceType
    ? [{ name: "metaobject_definition_id", value: definition.referenceDefinitionId }]
    : [];
  if (current && current.type?.name && current.type.name !== definition.type) {
    await deleteMetafieldDefinition(client, current.id);
    current = null;
  }
  if (!current) {
    const data = await client.request(`#graphql
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition { id namespace key pinnedPosition }
          userErrors { field message }
        }
      }
    `, {
      definition: {
        ownerType: "PRODUCT",
        namespace: definition.namespace,
        key: definition.key,
        name: definition.name,
        ...(definition.description ? { description: definition.description } : {}),
        type: definition.type,
        pin: Boolean(definition.pin),
        access,
        validations,
      },
    });
    return mutationPayload(data, "metafieldDefinitionCreate", definition.key).createdDefinition;
  }

  const data = await client.request(`#graphql
    mutation UpdateMetafieldDefinition($definition: MetafieldDefinitionUpdateInput!) {
      metafieldDefinitionUpdate(definition: $definition) {
        updatedDefinition { id namespace key pinnedPosition }
        userErrors { field message }
      }
    }
  `, {
    definition: {
      ownerType: "PRODUCT",
      namespace: definition.namespace,
      key: definition.key,
      name: definition.name,
      ...(definition.description ? { description: definition.description } : {}),
      access,
      validations,
    },
  });
  const updated = mutationPayload(
    data,
    "metafieldDefinitionUpdate",
    definition.key,
  ).updatedDefinition;
  if (!definition.pin || current.pinnedPosition != null) return updated;

  const pinData = await client.request(`#graphql
    mutation PinManagedMetafieldDefinition($identifier: MetafieldDefinitionIdentifierInput!) {
      metafieldDefinitionPin(identifier: $identifier) {
        pinnedDefinition { id namespace key pinnedPosition }
        userErrors { field message }
      }
    }
  `, {
    identifier: {
      ownerType: "PRODUCT",
      namespace: definition.namespace,
      key: definition.key,
    },
  });
  return mutationPayload(
    pinData,
    "metafieldDefinitionPin",
    definition.key,
  ).pinnedDefinition;
}

export async function upsertMetaobject(client, entry, baseLocale) {
  const content = entry.content[baseLocale];
  const fields = Object.entries({ ...content, ...(entry.price ? { price: entry.price } : {}) })
    .map(([key, value]) => ({ key, value: serializeFieldValue(value) }));
  const data = await client.request(`#graphql
    mutation UpsertManagedMetaobject($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id type handle }
        userErrors { field message }
      }
    }
  `, {
    handle: { type: entry.type, handle: entry.handle },
    metaobject: {
      fields,
      capabilities: { publishable: { status: "ACTIVE" } },
    },
  });
  return mutationPayload(data, "metaobjectUpsert", `${entry.type}:${entry.handle}`).metaobject;
}

export async function upsertProduct(client, product, baseLocale, current) {
  const content = product.content[baseLocale];
  const managedFields = {
    title: content.title,
    descriptionHtml: content.descriptionHtml,
    productType: product.productType,
    vendor: "Maison Rocheval",
    status: "ACTIVE",
  };

  if (current) {
    const data = await client.request(`#graphql
      mutation UpdateManagedProduct($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product { id handle }
          userErrors { field message }
        }
      }
    `, {
      product: {
        id: current.id,
        ...managedFields,
      },
    });
    return mutationPayload(data, "productUpdate", product.handle).product;
  }

  const data = await client.request(`#graphql
    mutation CreateManagedProduct($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
      productSet(identifier: $identifier, input: $input, synchronous: true) {
        product { id handle }
        userErrors { field message }
      }
    }
  `, {
    identifier: { handle: product.handle },
    input: {
      handle: product.handle,
      ...managedFields,
      productOptions: [{
        name: product.optionName,
        position: 1,
        values: product.variants.map(({ option }) => ({ name: option })),
      }],
      variants: product.variants.map((variant, index) => ({
        optionValues: [{ optionName: product.optionName, name: variant.option }],
        position: index + 1,
        price: variant.price,
        sku: variant.sku,
        inventoryItem: {
          requiresShipping: true,
          measurement: { weight: { value: variant.weightGrams, unit: "GRAMS" } },
        },
      })),
    },
  });
  return mutationPayload(data, "productSet", product.handle).product;
}

export function serializeFieldValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return value;
}

export function richTextValue(value) {
  if (!value) return null;
  const paragraphs = String(value)
    .split(/\n\n+/u)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return JSON.stringify({
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", value: "" }] }],
    });
  }

  return JSON.stringify({
    type: "root",
    children: paragraphs.map((para) => ({
      type: "paragraph",
      children: [{ type: "text", value: para }],
    })),
  });
}

function localized(value, locale) {
  if (value && !Array.isArray(value) && typeof value === "object" && locale in value) {
    return value[locale];
  }
  return value;
}

export function productTextMetafieldValues(product, locale) {
  if (product.kind !== "caviar") return {};
  const details = product.details;
  return {
    short_description: localized(details.shortDescription, locale),
    collection_line: localized(details.collectionLine, locale),
    species_scientific_name: localized(details.speciesScientificName, locale),
    species_description: richTextValue(localized(details.speciesDescription, locale)),
    pearl_size: localized(details.pearlSize, locale),
    pearl_colour: localized(details.pearlColour, locale),
    salt_content: localized(details.saltContent, locale),
    tasting_notes: JSON.stringify(localized(details.tastingNotes, locale)),
    ingredients: localized(details.ingredients, locale),
    nutrition: richTextValue(localized(details.nutrition, locale)),
    shelf_life: localized(details.shelfLife, locale),
    serving: richTextValue(localized(details.serving, locale)),
    shipping: richTextValue(localized(details.shipping, locale)),
    duration: richTextValue(localized(details.duration, locale)),
    box: richTextValue(localized(details.box, locale)),
    message: richTextValue(localized(details.message, locale)),
    add_ons: richTextValue(localized(details.addOns, locale)),
  };
}

export function productMetafieldInputs(product, baseLocale, registry) {
  if (product.kind !== "caviar") return [];
  const currentProduct = registry.products?.get(product.handle);
  const mediaNodes = currentProduct?.media?.nodes ?? [];
  const speciesImagePath = product.details?.speciesImage?.path;
  const speciesImageFilename = speciesImagePath ? speciesImagePath.split("/").at(-1) : null;
  const speciesMedia = speciesImagePath
    ? mediaNodes.find((m) => (
      m.image?.url?.split("?")[0].endsWith(`/${speciesImageFilename}`)
      || m.alt === product.details.speciesImage.alt.en
    ))
    : null;

  const values = {
    ...productTextMetafieldValues(product, baseLocale),
    ...(speciesMedia?.id ? { species_image: speciesMedia.id } : {}),
    related_products: JSON.stringify(product.relatedProducts.map((handle) => {
      const related = registry.products.get(handle);
      if (!related) throw new Error(`Related product ${handle} has not been provisioned.`);
      return related.id;
    })),
  };
  const types = new Map(registry.metafieldDefinitions.map((item) => (
    [item.key, item.type?.name ?? item.type]
  )));
  return Object.entries(values).map(([key, value]) => {
    if (value === undefined) throw new Error(`Missing value for rocheval.${key} on ${product.handle}.`);
    return {
      ownerId: registry.products.get(product.handle).id,
      namespace: "rocheval",
      key,
      type: types.get(key),
      value,
    };
  });
}

export async function setProductMetafields(client, product, baseLocale, registry) {
  const metafields = productMetafieldInputs(product, baseLocale, registry);
  if (metafields.length === 0) return [];
  const data = await client.request(`#graphql
    mutation SetManagedMetafields($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key value type }
        userErrors { field message }
      }
    }
  `, { metafields });
  return mutationPayload(data, "metafieldsSet", product.handle).metafields;
}

export async function addProductMedia(client, product, registry, uploadLocalImage) {
  const current = registry.products.get(product.handle);
  const mediaNodes = [...(current.media?.nodes ?? [])];
  const itemsToUpload = [];

  const primaryFilename = product.image.path.split("/").at(-1);
  const hasPrimary = mediaNodes.some((media) => (
    media.image?.url?.split("?")[0].endsWith(`/${primaryFilename}`) || media.alt === product.image.alt.en
  ));
  if (!hasPrimary) {
    itemsToUpload.push({
      path: product.image.path,
      alt: product.image.alt.en,
    });
  }

  if (product.kind === "caviar" && product.details?.speciesImage) {
    const speciesImage = product.details.speciesImage;
    const speciesFilename = speciesImage.path.split("/").at(-1);
    const hasSpecies = mediaNodes.some((media) => (
      media.image?.url?.split("?")[0].endsWith(`/${speciesFilename}`) || media.alt === speciesImage.alt.en
    ));
    if (!hasSpecies) {
      itemsToUpload.push({
        path: speciesImage.path,
        alt: speciesImage.alt.en,
      });
    }
  }

  if (itemsToUpload.length === 0) return;

  const uploadedMedia = [];
  for (const item of itemsToUpload) {
    const source = await uploadLocalImage(item.path);
    uploadedMedia.push({
      mediaContentType: "IMAGE",
      originalSource: source,
      alt: item.alt,
    });
  }

  const data = await client.request(`#graphql
    mutation AddManagedProductMedia($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
      productUpdate(product: $product, media: $media) {
        product {
          id
          handle
          media(first: 50) {
            nodes {
              id
              alt
              mediaContentType
              ... on MediaImage { image { url } }
            }
          }
        }
        userErrors { field message }
      }
    }
  `, {
    product: { id: current.id },
    media: uploadedMedia,
  });
  const updatedProduct = mutationPayload(data, "productUpdate", `${product.handle}:media`).product;
  if (updatedProduct?.media?.nodes) {
    current.media = updatedProduct.media;
  }
}

export async function upsertCollection(client, collection, baseLocale, current, productIds) {
  const content = collection.content[baseLocale];
  if (!current) {
    const data = await client.request(`#graphql
      mutation CreateManagedCollection($collection: CollectionCreateInput!) {
        collectionCreate(collection: $collection) {
          collection { id handle }
          userErrors { field message }
        }
      }
    `, {
      collection: {
        handle: collection.handle,
        title: content.title,
        descriptionHtml: content.descriptionHtml,
        sortOrder: "MANUAL",
        sources: [{
          source: {
            title: "Maison Rocheval provisioning",
            inclusion: {
              matchType: "ALL",
              selections: productIds.map((productId) => ({ productId })),
            },
          },
        }],
      },
    });
    const payload = mutationPayload(data, "collectionCreate", collection.handle);
    return { collection: payload.collection, jobId: null };
  }

  const currentIds = new Set(current.products.nodes.map(({ id }) => id));
  const selectionsToAdd = productIds
    .filter((productId) => !currentIds.has(productId))
    .map((productId) => ({ productId }));
  const data = await client.request(`#graphql
    mutation UpdateManagedCollection($collection: CollectionUpdateInput!) {
      collectionUpdate(collection: $collection) {
        collection { id handle }
        job { id done }
        userErrors { field message }
      }
    }
  `, {
    collection: {
      id: current.id,
      title: content.title,
      descriptionHtml: content.descriptionHtml,
      sortOrder: "MANUAL",
      ...(selectionsToAdd.length > 0 ? {
        sourcesToCreate: [{
          source: {
            title: "Maison Rocheval provisioning",
            inclusion: { matchType: "ALL", selections: selectionsToAdd },
          },
        }],
      } : {}),
    },
  });
  const payload = mutationPayload(data, "collectionUpdate", collection.handle);
  return { collection: payload.collection, jobId: payload.job?.id ?? null };
}

export async function waitForJob(client, jobId, { attempts = 40, intervalMs = 500 } = {}) {
  if (!jobId) return;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const data = await client.request(`#graphql
      query ManagedJob($id: ID!) { job(id: $id) { id done } }
    `, { id: jobId });
    if (data.job?.done) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, intervalMs));
  }
  throw new Error(`Shopify job ${jobId} did not finish in time.`);
}

export async function reorderCollectionProducts(client, collectionId, productIds) {
  if (productIds.length === 0) return;
  const data = await client.request(`#graphql
    mutation ReorderManagedCollection($id: ID!, $moves: [MoveInput!]!) {
      collectionReorderProducts(id: $id, moves: $moves) {
        job { id done }
        userErrors { field message }
      }
    }
  `, {
    id: collectionId,
    moves: productIds.map((id, newPosition) => ({ id, newPosition: String(newPosition) })),
  });
  const payload = mutationPayload(data, "collectionReorderProducts", collectionId);
  await waitForJob(client, payload.job?.id);
}

export function selectTranslatableValues(
  translatableContent,
  desiredValues,
  context = "resource",
) {
  const supportedKeys = new Set(
    translatableContent.filter(({ digest }) => Boolean(digest)).map(({ key }) => key),
  );
  const missingKeys = Object.keys(desiredValues).filter((key) => !supportedKeys.has(key));
  if (missingKeys.length > 0) {
    throw new Error(
      `Translation ${context} is missing Shopify translatable content for: ${missingKeys.join(", ")}.`,
    );
  }
  return { ...desiredValues };
}

export async function registerTranslations(client, resourceId, locale, desiredValues) {
  const data = await client.request(TRANSLATABLE_RESOURCE_QUERY, { resourceId, locale });
  const resource = data.translatableResource;
  if (!resource) throw new Error(`Resource ${resourceId} is not translatable.`);
  const digests = new Map(resource.translatableContent.map(({ key, digest }) => [key, digest]));
  const existing = new Map(resource.translations.map(({ key, value, outdated }) => [key, { value, outdated }]));
  const context = `${resourceId}:${locale}`;
  const supportedValues = selectTranslatableValues(
    resource.translatableContent,
    desiredValues,
    context,
  );
  const translations = Object.entries(supportedValues).flatMap(([key, value]) => {
    const current = existing.get(key);
    if (current?.value === value && !current.outdated) return [];
    const translatableContentDigest = digests.get(key);
    return [{ key, locale, value, translatableContentDigest }];
  });
  if (translations.length === 0) return;

  const response = await client.request(`#graphql
    mutation RegisterManagedTranslations($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        translations { key locale value }
        userErrors { field message }
      }
    }
  `, { resourceId, translations });
  mutationPayload(response, "translationsRegister", `${resourceId}:${locale}`);
}

export async function publishResources(client, publicationId, ids) {
  for (const id of ids) {
    const data = await client.request(`#graphql
      mutation PublishManagedResource($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          userErrors { field message }
        }
      }
    `, { id, input: [{ publicationId }] });
    mutationPayload(data, "publishablePublish", id);
  }
}

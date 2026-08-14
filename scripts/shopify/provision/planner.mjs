import { createHash } from "node:crypto";

import { metaobjectTranslationContent } from "./translations.mjs";

const PHASES = [
  "definitions",
  "metaobjects",
  "products",
  "product-content",
  "collections",
  "localization",
  "publication",
];

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableValue(nested)]),
    );
  }
  return value;
}

export function resourceSignature(value) {
  return createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
}

function resource(phase, kind, key, data, dependencies = []) {
  return {
    phase,
    kind,
    key,
    dependencies,
    signature: resourceSignature(data),
    data,
  };
}

export function compileDesiredResources(manifest) {
  const resources = [];
  const metaobjectDefinitions = new Map(
    manifest.metaobjectDefinitions.map((definition) => [definition.type, definition]),
  );

  for (const definition of manifest.metaobjectDefinitions) {
    resources.push(resource(
      "definitions",
      "metaobject-definition",
      `metaobject-definition:${definition.type}`,
      definition,
    ));
  }
  for (const definition of manifest.metafieldDefinitions) {
    const dependencies = definition.referenceType
      ? [`metaobject-definition:${definition.referenceType}`]
      : [];
    resources.push(resource(
      "definitions",
      "metafield-definition",
      `metafield-definition:PRODUCT:${definition.namespace}.${definition.key}`,
      definition,
      dependencies,
    ));
  }

  for (const entry of Object.values(manifest.metaobjects).flat()) {
    resources.push(resource(
      "metaobjects",
      "metaobject",
      `metaobject:${entry.type}:${entry.handle}`,
      entry,
      [`metaobject-definition:${entry.type}`],
    ));
  }

  for (const product of manifest.products) {
    resources.push(resource(
      "products",
      "product",
      `product:${product.handle}`,
      {
        kind: product.kind,
        handle: product.handle,
        productType: product.productType,
        optionName: product.optionName,
        variants: product.variants,
        content: product.content,
      },
    ));
    resources.push(resource(
      "product-content",
      "product-content",
      `product-content:${product.handle}`,
      {
        handle: product.handle,
        image: product.image,
        details: product.details,
        relatedProducts: product.relatedProducts,
      },
      [
        `product:${product.handle}`,
        ...product.relatedProducts.map((handle) => `product:${handle}`),
      ],
    ));
  }

  for (const collection of manifest.collections) {
    resources.push(resource(
      "collections",
      "collection",
      `collection:${collection.handle}`,
      collection,
      collection.products.map((handle) => `product:${handle}`),
    ));
  }

  for (const locale of manifest.locales) {
    resources.push(resource(
      "localization",
      "localization",
      `localization:${locale}`,
      {
        locale,
        products: manifest.products.map(({ handle, content, details }) => ({ handle, content: content[locale], details })),
        collections: manifest.collections.map(({ handle, content }) => ({ handle, content: content[locale] })),
        metaobjects: Object.values(manifest.metaobjects).flat().map((entry) => ({
          handle: entry.handle,
          type: entry.type,
          content: metaobjectTranslationContent(
            entry,
            metaobjectDefinitions.get(entry.type),
            locale,
          ),
        })),
      },
      [
        ...manifest.products.map(({ handle }) => `product:${handle}`),
        ...manifest.collections.map(({ handle }) => `collection:${handle}`),
      ],
    ));
  }

  resources.push(resource(
    "publication",
    "publication",
    "publication:headless",
    {
      products: manifest.products.map(({ handle }) => handle),
      collections: manifest.collections.map(({ handle }) => handle),
      metaobjects: Object.values(manifest.metaobjects).flat().map(({ handle, type }) => ({ handle, type })),
    },
    [
      ...manifest.products.map(({ handle }) => `product:${handle}`),
      ...manifest.collections.map(({ handle }) => `collection:${handle}`),
    ],
  ));

  return resources.sort((left, right) => {
    const phaseOrder = PHASES.indexOf(left.phase) - PHASES.indexOf(right.phase);
    return phaseOrder || left.key.localeCompare(right.key);
  });
}

export function buildProvisionPlan(manifest, currentResources) {
  const currentByKey = new Map(currentResources.map((item) => [item.key, item]));

  return compileDesiredResources(manifest).flatMap((desired) => {
    const current = currentByKey.get(desired.key);
    if (current?.kind === desired.kind && current.signature === desired.signature) return [];
    return [{
      ...desired,
      operation: current ? "UPDATE" : "CREATE",
    }];
  });
}

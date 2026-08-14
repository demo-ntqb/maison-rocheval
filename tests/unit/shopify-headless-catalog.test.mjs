import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  mapCollectionProductProfiles,
  mapCollectionProducts,
  mapProductDetail,
} from "../../src/shared/lib/shopify/catalog-mapper.ts";
import {
  shopifyWebhookTags,
  verifyShopifyWebhookHmac,
} from "../../src/shared/lib/shopify/webhook.ts";

const money = (amount) => ({ amount, currencyCode: "EUR" });
const image = {
  altText: "Open Kaluga caviar tin",
  height: 550,
  url: "https://cdn.shopify.com/kaluga.png",
  width: 400,
};
function metafield(key, type, value, extra = {}) {
  return { key, type, value, ...extra };
}

function product(handle = "kaluga") {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: "Kaluga Caviar",
    descriptionHtml: "<p>Large supple pearls.</p>",
    availableForSale: false,
    featuredImage: image,
    images: { nodes: [image] },
    priceRange: { minVariantPrice: money("159.0") },
    metafields: [
      metafield("short_description", "multi_line_text_field", "Large, supple pearls."),
      metafield("collection_line", "single_line_text_field", "Patrimoine"),
      metafield("species_scientific_name", "single_line_text_field", "Huso dauricus"),
      metafield("species_description", "multi_line_text_field", "Large supple pearls."),
      metafield("pearl_size", "single_line_text_field", "3.2mm – 3.8mm"),
      metafield("pearl_colour", "single_line_text_field", "Warm bronze"),
      metafield("salt_content", "single_line_text_field", "3.0% – 3.5%"),
      metafield("tasting_notes", "list.single_line_text_field", '["Rich","Creamy"]'),
      metafield("ingredients", "multi_line_text_field", "Sturgeon roe, salt"),
      metafield("nutrition", "rich_text_field", '{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"254 kcal"}]}]}'),
      metafield("shelf_life", "single_line_text_field", "Four weeks refrigerated"),
      metafield("storage", "rich_text_field", '{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"Keep refrigerated."}]}]}'),
      metafield("serving", "rich_text_field", '{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"Serve chilled."}]}]}'),
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/30",
          title: "30g",
          sku: "MR-KALUGA-030",
          availableForSale: false,
          price: money("159.0"),
          selectedOptions: [{ name: "Size", value: "30g" }],
        },
        {
          id: "gid://shopify/ProductVariant/50",
          title: "50g",
          sku: "MR-KALUGA-050",
          availableForSale: true,
          price: money("259.0"),
          selectedOptions: [{ name: "Size", value: "50g" }],
        },
      ],
    },
  };
}

test("collection mapper giữ Shopify order và custom product content", () => {
  const first = product("amour");
  first.title = "Amour Caviar";
  const second = product("kaluga");
  const cards = mapCollectionProducts([first, second]);

  assert.deepEqual(cards.map(({ handle }) => handle), ["amour", "kaluga"]);
  assert.equal(cards[1].eyebrow, "Patrimoine");
  assert.equal(cards[1].species, "Huso dauricus");
  assert.equal(cards[1].profile, "Rich · Creamy");
  assert.equal(cards[1].description, "Large, supple pearls.");
  assert.deepEqual(cards[1].image, image);
});

test("profile collection mapper cấp đủ dữ liệu cho selector Understand the product", () => {
  const profiles = mapCollectionProductProfiles([product("amour"), product("kaluga")]);

  assert.deepEqual(profiles.map(({ handle }) => handle), ["amour", "kaluga"]);
  assert.equal(profiles[1].speciesDescription, "Large supple pearls.");
  assert.equal(profiles[1].serving, "Serve chilled.");
  assert.deepEqual(profiles[1].specs, {
    color: "Warm bronze",
    pearlSize: "3.2mm – 3.8mm",
    salt: "3.0% – 3.5%",
    tastingNotes: "Rich · Creamy",
  });
  assert.deepEqual(profiles[1].galleryImages, [image]);
});

test("detail mapper dùng exact variants, rich text, packaging và related references", () => {
  const raw = product();
  raw.metafields.push(metafield("related_products", "list.product_reference", "[]", {
    references: { nodes: [product("amour")] },
  }));
  const presentationBox = product("presentation-box");
  presentationBox.variants.nodes = [
    {
      id: "gid://shopify/ProductVariant/premium",
      title: "Premium",
      sku: "MR-BOX-PREMIUM",
      availableForSale: true,
      price: money("32.0"),
      selectedOptions: [{ name: "Packaging", value: "Premium" }],
    },
  ];
  const presentationOptions = [
    {
      type: "presentation_option",
      handle: "standard",
      fields: [
        { key: "name", type: "single_line_text_field", value: "Standard" },
        { key: "description", type: "multi_line_text_field", value: "Paper bag with ice" },
        { key: "price", type: "number_decimal", value: "0.0" },
        { key: "personalized_message", type: "boolean", value: "false" },
      ],
    },
    {
      type: "presentation_option",
      handle: "premium",
      fields: [
        { key: "name", type: "single_line_text_field", value: "Premium" },
        { key: "description", type: "multi_line_text_field", value: "Quality box" },
        { key: "price", type: "number_decimal", value: "32.0" },
        { key: "personalized_message", type: "boolean", value: "true" },
      ],
    },
  ];

  const detail = mapProductDetail(raw, presentationOptions, presentationBox);

  assert.deepEqual(detail.variants.map(({ optionValue, price }) => [optionValue, price.amount]), [
    ["30g", "159.0"],
    ["50g", "259.0"],
  ]);
  assert.equal(detail.specs.nutritionalData, "254 kcal");
  assert.equal(detail.storage, "Keep refrigerated.");
  assert.equal(detail.serving, "Serve chilled.");
  assert.equal(detail.packagingOptions[0].variantId, null);
  assert.equal(detail.packagingOptions[1].variantId, "gid://shopify/ProductVariant/premium");
  assert.equal(detail.packagingOptions[1].priceModifier, 32);
  assert.deepEqual(detail.relatedProducts.map(({ handle }) => handle), ["amour"]);
});

test("webhook HMAC dùng raw body và tags theo resource", () => {
  const body = JSON.stringify({ handle: "premium", type: "presentation_option" });
  const secret = "shopify-client-secret";
  const validHeader = createHmac("sha256", secret).update(body).digest("base64");

  assert.equal(verifyShopifyWebhookHmac(body, validHeader, secret), true);
  assert.equal(verifyShopifyWebhookHmac(`${body}x`, validHeader, secret), false);
  assert.equal(verifyShopifyWebhookHmac(body, "bad", secret), false);
  assert.deepEqual(shopifyWebhookTags("products/update", { handle: "kaluga" }), [
    "shopify-products",
    "shopify-product-kaluga",
  ]);
  assert.deepEqual(shopifyWebhookTags("collections/update", { handle: "our-caviar" }), [
    "shopify-collections",
    "shopify-collection-our-caviar",
  ]);
  assert.deepEqual(shopifyWebhookTags("metaobjects/update", { type: "presentation_option" }), [
    "shopify-products",
    "shopify-metaobjects",
  ]);
});

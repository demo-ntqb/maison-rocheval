import "server-only";

import { getShopifyMarket } from "../config";
import { getBuyerStorefrontClient, type StorefrontClient } from "../storefront";
import { buildCartOrderNote } from "./cart.order-note";
import { CART_ATTRIBUTE, isGiftSetMerchandise, mapShopifyCart } from "./cart.mapper";
import {
  CART_BUYER_IDENTITY_UPDATE,
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_NOTE_UPDATE,
} from "./cart.mutation";
import { CART_MERCHANDISE_QUERY, CART_QUERY } from "./cart.query";
import { CartServiceError, throwForUserErrors } from "./cart.error";
import type {
  ShopifyCart,
  ShopifyCartAttribute,
  ShopifyCartLine,
  ShopifyCartMerchandiseNode,
  ShopifyCartPayload,
  ShopifyCartWarning,
} from "./cart.type";
import type { CartGiftMessage, CartSnapshot } from "@/shared/types/cart.type";
import type { RouteLocale, SupportedCountry } from "@/shared/types/commerce-context.type";

const CART_PAGE_SIZE = 100;

type CartServiceResult = {
  cartId: string;
  rawCart: ShopifyCart;
  snapshot: CartSnapshot;
  warnings: ShopifyCartWarning[];
};

type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{ key: string; value: string }>;
};

export type ResolvedCartMerchandise = {
  merchandiseId: string;
  kind: "caviar" | "gift_set";
  requiresComponents: boolean;
};

function cartVariables(locale: RouteLocale) {
  const market = getShopifyMarket(locale);
  return { market, language: market.language };
}

function assertTransport<T extends object>(result: T & { errors?: Array<{ message: string }> }): T {
  if (result.errors?.length) {
    throw new CartServiceError("UPSTREAM_UNAVAILABLE", "Shopify cart request failed", 502, true);
  }
  return result;
}

function normalizeResult(
  cart: ShopifyCart,
  country: SupportedCountry,
  warnings: ShopifyCartWarning[] = [],
): CartServiceResult {
  return {
    cartId: cart.id,
    rawCart: cart,
    snapshot: mapShopifyCart(cart, country, warnings),
    warnings,
  };
}

function attributesToRecord(attributes: ShopifyCartAttribute[]): Record<string, string> {
  return Object.fromEntries(attributes.map(({ key, value }) => [key, value]));
}

function isGiftSetProductType(productType: string): boolean {
  const normalized = productType.trim().toLowerCase();
  return normalized.includes("gift") || normalized.includes("coffret");
}

function isComponentizedLine(line: ShopifyCartLine): boolean {
  return line.merchandise.requiresComponents;
}

export async function resolveCartMerchandise({
  request,
  locale,
  merchandiseId,
}: {
  request: Request;
  locale: RouteLocale;
  merchandiseId: string;
}): Promise<ResolvedCartMerchandise> {
  const client = getBuyerStorefrontClient(locale, request);
  const response = assertTransport(
    await client.query<{ node: ShopifyCartMerchandiseNode | null }>(CART_MERCHANDISE_QUERY, {
      variables: { id: merchandiseId },
    }),
  );
  const node = response.node;
  if (
    !node ||
    node.__typename !== "ProductVariant" ||
    typeof node.id !== "string" ||
    typeof node.requiresComponents !== "boolean" ||
    !node.product
  ) {
    throw new CartServiceError("INVALID_INPUT", "Cart merchandise is unavailable", 400);
  }

  const giftProductType = isGiftSetProductType(node.product.productType);
  if (node.requiresComponents !== giftProductType) {
    throw new CartServiceError(
      "INVALID_INPUT",
      "Cart merchandise has an unsupported bundle configuration",
      400,
    );
  }

  return {
    merchandiseId: node.id,
    kind: giftProductType ? "gift_set" : "caviar",
    requiresComponents: node.requiresComponents,
  };
}

async function queryCartPage(
  client: StorefrontClient,
  cartId: string,
  locale: RouteLocale,
  after?: string,
): Promise<ShopifyCart | null> {
  const { language } = cartVariables(locale);
  const response = assertTransport(
    await client.query<{ cart: ShopifyCart | null }>(CART_QUERY, {
      variables: {
        id: cartId,
        first: CART_PAGE_SIZE,
        after: after ?? null,
        language,
      },
    }),
  );
  return response.cart;
}

async function getFullCartWithClient(
  client: StorefrontClient,
  cartId: string,
  locale: RouteLocale,
): Promise<ShopifyCart | null> {
  const first = await queryCartPage(client, cartId, locale);
  if (!first) return null;

  const nodes = [...first.lines.nodes];
  let pageInfo = first.lines.pageInfo;

  while (pageInfo.hasNextPage && pageInfo.endCursor) {
    const page = await queryCartPage(client, cartId, locale, pageInfo.endCursor);
    if (!page) return null;
    nodes.push(...page.lines.nodes);
    pageInfo = page.lines.pageInfo;
  }

  return { ...first, lines: { nodes, pageInfo } };
}

async function completeMutationCart(
  client: StorefrontClient,
  cart: ShopifyCart,
  locale: RouteLocale,
): Promise<ShopifyCart> {
  if (!cart.lines.pageInfo.hasNextPage) return cart;
  return (await getFullCartWithClient(client, cart.id, locale)) ?? cart;
}

async function executeMutation(
  client: StorefrontClient,
  document: string,
  payloadKey: string,
  variables: Record<string, unknown>,
  locale: RouteLocale,
): Promise<{ cart: ShopifyCart; warnings: ShopifyCartWarning[] }> {
  const response = assertTransport(
    await client.query<Record<string, ShopifyCartPayload>>(document, {
      variables: {
        ...variables,
        first: CART_PAGE_SIZE,
        after: null,
        language: cartVariables(locale).language,
      },
    }),
  );

  const payload = response[payloadKey];
  if (!payload) {
    throw new CartServiceError(
      "UPSTREAM_UNAVAILABLE",
      "Shopify returned an invalid cart payload",
      502,
      true,
    );
  }
  throwForUserErrors(payload.userErrors ?? []);
  if (!payload.cart) {
    throw new CartServiceError("CART_NOT_FOUND", "Cart is unavailable", 404);
  }

  return {
    cart: await completeMutationCart(client, payload.cart, locale),
    warnings: payload.warnings ?? [],
  };
}

function caviarLine(merchandiseId: string, quantity: number): CartLineInput {
  return { merchandiseId, quantity };
}

function giftLines(merchandiseId: string, unitIds: string[]): CartLineInput[] {
  return unitIds.map((unitId) => ({
    merchandiseId,
    quantity: 1,
    attributes: [{ key: CART_ATTRIBUTE.unitId, value: unitId }],
  }));
}

export function buildInitialCartLines(
  input:
    | { kind: "caviar"; merchandiseId: string; quantity: number }
    | { kind: "gift_set"; merchandiseId: string; unitIds: string[] },
): CartLineInput[] {
  return input.kind === "caviar"
    ? [caviarLine(input.merchandiseId, input.quantity)]
    : giftLines(input.merchandiseId, input.unitIds);
}

export async function getCart({
  request,
  cartId,
  locale,
}: {
  request: Request;
  cartId: string;
  locale: RouteLocale;
}): Promise<CartServiceResult | null> {
  const client = getBuyerStorefrontClient(locale, request);
  const cart = await getFullCartWithClient(client, cartId, locale);
  if (!cart) return null;
  return normalizeResult(cart, cartVariables(locale).market.country);
}

export async function createCartWithLines({
  request,
  locale,
  lines,
}: {
  request: Request;
  locale: RouteLocale;
  lines: CartLineInput[];
}): Promise<CartServiceResult> {
  const client = getBuyerStorefrontClient(locale, request);
  const { market } = cartVariables(locale);
  const result = await executeMutation(
    client,
    CART_CREATE,
    "cartCreate",
    { input: { buyerIdentity: { countryCode: market.country }, lines } },
    locale,
  );
  return normalizeResult(result.cart, market.country, result.warnings);
}

export async function addCaviar({
  request,
  locale,
  cartId,
  merchandiseId,
  quantity,
}: {
  request: Request;
  locale: RouteLocale;
  cartId: string;
  merchandiseId: string;
  quantity: number;
}): Promise<CartServiceResult | null> {
  const client = getBuyerStorefrontClient(locale, request);
  const current = await getFullCartWithClient(client, cartId, locale);
  if (!current) return null;

  const existing = current.lines.nodes.find(
    (line) => !isComponentizedLine(line) && line.merchandise.id === merchandiseId,
  );

  const result = existing
    ? await executeMutation(
        client,
        CART_LINES_UPDATE,
        "cartLinesUpdate",
        { cartId, lines: [{ id: existing.id, quantity: existing.quantity + quantity }] },
        locale,
      )
    : await executeMutation(
        client,
        CART_LINES_ADD,
        "cartLinesAdd",
        { cartId, lines: [caviarLine(merchandiseId, quantity)] },
        locale,
      );

  return normalizeResult(result.cart, cartVariables(locale).market.country, result.warnings);
}

export async function addGiftSet({
  request,
  locale,
  cartId,
  merchandiseId,
  unitIds,
}: {
  request: Request;
  locale: RouteLocale;
  cartId: string;
  merchandiseId: string;
  unitIds: string[];
}): Promise<CartServiceResult> {
  const client = getBuyerStorefrontClient(locale, request);
  const result = await executeMutation(
    client,
    CART_LINES_ADD,
    "cartLinesAdd",
    { cartId, lines: giftLines(merchandiseId, unitIds) },
    locale,
  );
  return normalizeResult(result.cart, cartVariables(locale).market.country, result.warnings);
}

export async function updateCartLineQuantity({
  request,
  locale,
  cartId,
  lineId,
  quantity,
}: {
  request: Request;
  locale: RouteLocale;
  cartId: string;
  lineId: string;
  quantity: number;
}): Promise<CartServiceResult> {
  const client = getBuyerStorefrontClient(locale, request);
  const current = await getFullCartWithClient(client, cartId, locale);
  const line = current?.lines.nodes.find((candidate) => candidate.id === lineId);
  if (!line) throw new CartServiceError("LINE_NOT_FOUND", "Cart line not found", 404);
  if (isComponentizedLine(line)) {
    throw new CartServiceError(
      "INVALID_INPUT",
      "Componentized physical units cannot change quantity",
      400,
    );
  }

  const result = await executeMutation(
    client,
    CART_LINES_UPDATE,
    "cartLinesUpdate",
    { cartId, lines: [{ id: lineId, quantity }] },
    locale,
  );
  return normalizeResult(result.cart, cartVariables(locale).market.country, result.warnings);
}

function mergeGiftAttributes(
  attributes: ShopifyCartAttribute[],
  giftMessage: CartGiftMessage | null,
): ShopifyCartAttribute[] {
  const next = new Map(attributes.map(({ key, value }) => [key, value]));
  next.delete(CART_ATTRIBUTE.legacyKind);
  next.delete(CART_ATTRIBUTE.giftMessageKind);
  next.delete(CART_ATTRIBUTE.giftMessage);

  if (giftMessage?.kind === "blank") {
    next.set(CART_ATTRIBUTE.giftMessageKind, "blank");
  } else if (giftMessage?.kind === "personal") {
    next.set(CART_ATTRIBUTE.giftMessageKind, "personal");
    next.set(CART_ATTRIBUTE.giftMessage, giftMessage.text);
  }

  return Array.from(next, ([key, value]) => ({ key, value }));
}

export async function updateGiftMessage({
  request,
  locale,
  cartId,
  lineId,
  giftMessage,
}: {
  request: Request;
  locale: RouteLocale;
  cartId: string;
  lineId: string;
  giftMessage: CartGiftMessage | null;
}): Promise<CartServiceResult> {
  const client = getBuyerStorefrontClient(locale, request);
  const current = await getFullCartWithClient(client, cartId, locale);
  const line = current?.lines.nodes.find((candidate) => candidate.id === lineId);
  if (!line) throw new CartServiceError("LINE_NOT_FOUND", "Cart line not found", 404);

  const attrs = attributesToRecord(line.attributes);
  if (!isGiftSetMerchandise(line.merchandise) || !attrs[CART_ATTRIBUTE.unitId]) {
    throw new CartServiceError(
      "INVALID_INPUT",
      "Gift messages require a stable gift-set unit",
      400,
    );
  }

  const result = await executeMutation(
    client,
    CART_LINES_UPDATE,
    "cartLinesUpdate",
    {
      cartId,
      lines: [{ id: lineId, attributes: mergeGiftAttributes(line.attributes, giftMessage) }],
    },
    locale,
  );
  return normalizeResult(result.cart, cartVariables(locale).market.country, result.warnings);
}

export async function removeCartLine({
  request,
  locale,
  cartId,
  lineId,
}: {
  request: Request;
  locale: RouteLocale;
  cartId: string;
  lineId: string;
}): Promise<CartServiceResult> {
  const client = getBuyerStorefrontClient(locale, request);
  const result = await executeMutation(
    client,
    CART_LINES_REMOVE,
    "cartLinesRemove",
    { cartId, lineIds: [lineId] },
    locale,
  );
  return normalizeResult(result.cart, cartVariables(locale).market.country, result.warnings);
}

export async function updateCartBuyerIdentity({
  request,
  locale,
  cartId,
}: {
  request: Request;
  locale: RouteLocale;
  cartId: string;
}): Promise<CartServiceResult> {
  const client = getBuyerStorefrontClient(locale, request);
  const { market } = cartVariables(locale);
  const result = await executeMutation(
    client,
    CART_BUYER_IDENTITY_UPDATE,
    "cartBuyerIdentityUpdate",
    { cartId, buyerIdentity: { countryCode: market.country } },
    locale,
  );
  return normalizeResult(result.cart, market.country, result.warnings);
}

export async function getCheckoutCart({
  request,
  locale,
  cartId,
}: {
  request: Request;
  locale: RouteLocale;
  cartId: string;
}): Promise<ShopifyCart | null> {
  const client = getBuyerStorefrontClient(locale, request);
  const { market } = cartVariables(locale);
  let cart = await getFullCartWithClient(client, cartId, locale);
  if (!cart) return null;

  if (cart.buyerIdentity.countryCode !== market.country) {
    cart = (
      await executeMutation(
        client,
        CART_BUYER_IDENTITY_UPDATE,
        "cartBuyerIdentityUpdate",
        { cartId, buyerIdentity: { countryCode: market.country } },
        locale,
      )
    ).cart;
  }

  cart = (
    await executeMutation(
      client,
      CART_NOTE_UPDATE,
      "cartNoteUpdate",
      { cartId, note: buildCartOrderNote(cart) },
      locale,
    )
  ).cart;

  return cart;
}

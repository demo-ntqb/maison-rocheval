import { z } from "zod";

import { CART_QUANTITY_MAX, GIFT_MESSAGE_MAX_LINES } from "@/shared/constants/cart.constant";
import { ROUTE_LOCALES } from "@/shared/constants/commerce-context.constant";

const routeLocaleSchema = z.enum(ROUTE_LOCALES);
const operationIdSchema = z.string().min(1).max(128);
const merchandiseIdSchema = z.string().startsWith("gid://shopify/ProductVariant/");
const lineIdSchema = z.string().startsWith("gid://shopify/CartLine/");
const quantitySchema = z.number().int().min(1).max(CART_QUANTITY_MAX);
const unitIdsSchema = z.array(z.string().min(1).max(128)).min(1).max(CART_QUANTITY_MAX);

const giftMessageSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("blank") }),
    z.object({ kind: z.literal("personal"), text: z.string().min(1) }),
  ])
  .superRefine((message, context) => {
    if (message.kind !== "personal") return;
    if (message.text.split("\n").length > GIFT_MESSAGE_MAX_LINES) {
      context.addIssue({
        code: "custom",
        message: `Gift message cannot exceed ${GIFT_MESSAGE_MAX_LINES} lines`,
      });
    }
  });

export const addCartLineSchema = z
  .object({
    merchandiseId: merchandiseIdSchema,
    quantity: quantitySchema,
    unitIds: unitIdsSchema.optional(),
    operationId: operationIdSchema,
    locale: routeLocaleSchema,
  })
  .superRefine((value, context) => {
    if (!value.unitIds) return;
    if (value.unitIds.length !== value.quantity || new Set(value.unitIds).size !== value.unitIds.length) {
      context.addIssue({ code: "custom", message: "Gift unit IDs must be unique and match quantity" });
    }
  });

export const updateCartLineSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("quantity"),
    lineId: lineIdSchema,
    quantity: quantitySchema,
    operationId: operationIdSchema,
    locale: routeLocaleSchema,
  }),
  z.object({
    action: z.literal("gift_message"),
    lineId: lineIdSchema,
    giftMessage: giftMessageSchema.nullable(),
    operationId: operationIdSchema,
    locale: routeLocaleSchema,
  }),
]);

export const removeCartLineSchema = z.object({
  lineId: lineIdSchema,
  operationId: operationIdSchema,
  locale: routeLocaleSchema,
});

export const checkoutSchema = z.object({ locale: routeLocaleSchema });
export const regionSchema = z.object({ locale: routeLocaleSchema });

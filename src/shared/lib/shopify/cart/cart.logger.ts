import "server-only";

export type CartLogEvent = {
  action: string;
  operationId?: string;
  kind?: "caviar" | "gift_set";
  quantity?: number;
  country?: string;
  locale?: string;
  durationMs?: number;
  warningCodes?: string[];
  result: "success" | "failure" | "reconciled";
  errorCode?: string;
  hasGiftMessage?: boolean;
  messageLength?: number;
};

/**
 * Structured cart logging intentionally excludes cart IDs, checkout URLs,
 * access tokens and gift-message text.
 */
export function logCartEvent(event: CartLogEvent): void {
  console.info("[shopify-cart]", JSON.stringify(event));
}

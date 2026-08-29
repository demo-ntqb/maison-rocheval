import type { CartGiftMessage, CartSnapshot, CartWarning } from "@/shared/types/cart.type";
import type { RouteLocale } from "@/shared/types/commerce-context.type";

export type CartMutationResponse = {
  operationId: string;
  cart: CartSnapshot;
  warnings: CartWarning[];
};

export class CartClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "CartClientError";
  }
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload = await parseJson(response);
  if (!response.ok) {
    const error =
      typeof payload === "object" && payload !== null && "error" in payload
        ? (payload.error as { code?: unknown; message?: unknown; retryable?: unknown })
        : null;
    throw new CartClientError(
      typeof error?.code === "string" ? error.code : "UPSTREAM_UNAVAILABLE",
      typeof error?.message === "string" ? error.message : "Cart request failed",
      error?.retryable === true,
    );
  }
  return payload as T;
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export async function fetchCart(locale: RouteLocale): Promise<CartSnapshot> {
  const payload = await requestJson<{ cart: CartSnapshot }>(
    `/api/cart?locale=${encodeURIComponent(locale)}`,
  );
  return payload.cart;
}

export async function addLine(input:
  | {
      kind: "caviar";
      merchandiseId: string;
      quantity: number;
      operationId: string;
      locale: RouteLocale;
    }
  | {
      kind: "gift_set";
      merchandiseId: string;
      quantity: number;
      unitIds: string[];
      operationId: string;
      locale: RouteLocale;
    },
): Promise<CartMutationResponse> {
  return requestJson("/api/cart/lines", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export async function updateQuantity(input: {
  lineId: string;
  quantity: number;
  operationId: string;
  locale: RouteLocale;
}): Promise<CartMutationResponse> {
  return requestJson("/api/cart/line", {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ action: "quantity", ...input }),
  });
}

export async function updateGiftMessage(input: {
  lineId: string;
  giftMessage: CartGiftMessage | null;
  operationId: string;
  locale: RouteLocale;
}): Promise<CartMutationResponse> {
  return requestJson("/api/cart/line", {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ action: "gift_message", ...input }),
  });
}

export async function removeLine(input: {
  lineId: string;
  operationId: string;
  locale: RouteLocale;
}): Promise<CartMutationResponse> {
  return requestJson("/api/cart/remove", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export async function fetchCheckout(locale: RouteLocale): Promise<{ checkoutUrl: string }> {
  return requestJson("/api/cart/checkout", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ locale }),
  });
}

export async function updateRegion(locale: RouteLocale): Promise<{
  countryCode: string;
  cart?: CartSnapshot;
}> {
  return requestJson("/api/region", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ locale }),
  });
}

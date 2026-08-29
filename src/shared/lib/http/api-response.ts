import { NextResponse } from "next/server";

import { CartServiceError } from "@/shared/lib/shopify/cart/cart.error";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export function jsonNoStore<T>(body: T, init?: { status?: number }) {
  return NextResponse.json(body, { status: init?.status, headers: NO_STORE_HEADERS });
}

export function cartApiError(error: unknown, operationId?: string) {
  if (error instanceof CartServiceError) {
    return jsonNoStore(
      {
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
          ...(error.field ? { field: error.field } : {}),
        },
        ...(operationId ? { operationId } : {}),
      },
      { status: error.status },
    );
  }

  return jsonNoStore(
    {
      error: {
        code: "UPSTREAM_UNAVAILABLE",
        message: "Cart service is temporarily unavailable",
        retryable: true,
      },
      ...(operationId ? { operationId } : {}),
    },
    { status: 503 },
  );
}

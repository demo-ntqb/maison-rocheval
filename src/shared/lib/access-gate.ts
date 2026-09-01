import type { SupportedCountry } from "@/shared/types/commerce-context.type";

export const ACCESS_GATE_COOKIE = "mr_us_access";

// NOTE: US marketplace will be the first one to use this feature
// We use custom logic instead of Shopify's access gate (see shopify.middleware.ts)
export function shouldShowAccessGate(country: SupportedCountry): boolean {
  return country === "US";
}

export function isAccessGatePinValid(value: string | null): boolean {
  const pin = process.env.ACCESS_GATE_PIN_US?.trim();
  return Boolean(pin && value === pin);
}

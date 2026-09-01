import type { SupportedCountry } from "@/shared/types/commerce-context.type";

export const ACCESS_GATE_COOKIE = "mr_us_access";

export function shouldShowAccessGate(country: SupportedCountry): boolean {
  return country === "US";
}

export function isAccessGatePinValid(value: string | null): boolean {
  const pin = process.env.ACCESS_GATE_PIN_US?.trim();
  return Boolean(pin && value === pin);
}

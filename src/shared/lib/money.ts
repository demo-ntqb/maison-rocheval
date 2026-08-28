import { parseCommerceContext } from "./commerce-context";
import type { AppLocale } from "../types/commerce-context.type";

function resolveAppLocale(localeOrRoute: string): AppLocale {
  const norm = localeOrRoute.toLowerCase().trim();
  if (norm === "fr" || norm.startsWith("fr-")) return "fr";
  if (norm === "en" || norm.startsWith("en-")) return "en";
  try {
    return parseCommerceContext(norm).appLocale;
  } catch {
    return "en";
  }
}

/**
 * Shared formatter for Shopify MoneyV2 presentation.
 * - Formats numbers based on appLocale (en: 1,000.00, fr: 1 000,00)
 * - Trailing currency placement aligned with Maison Rocheval brand design
 * - Disambiguates symbols like SGD (SGD / S$) vs USD ($)
 */
export function formatBrandPrice(
  amount: number | string,
  currencyCode: string,
  localeOrRoute = "en",
  { minimumFractionDigits = 2 }: { minimumFractionDigits?: number } = {},
): string {
  const numericAmount = typeof amount === "number" ? amount : Number.parseFloat(amount) || 0;
  const appLocale = resolveAppLocale(localeOrRoute);
  const intlLocale = appLocale === "fr" ? "fr-FR" : "en-US";

  const formattedNumber = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 2,
    minimumFractionDigits,
  }).format(numericAmount);

  const upperCurrency = (currencyCode || "EUR").toUpperCase().trim();

  // Symbol resolution with disambiguation
  let symbol: string;
  if (upperCurrency === "SGD") {
    symbol = "SGD";
  } else if (upperCurrency === "EUR") {
    symbol = "€";
  } else if (upperCurrency === "USD") {
    symbol = "$";
  } else {
    symbol = upperCurrency;
  }

  // Format placement: brand uses trailing symbol
  if (appLocale === "fr") {
    return `${formattedNumber} ${symbol}`;
  }

  // English: if symbol is 3-letter currency code (like SGD), add space; otherwise attach directly (e.g. 100.00$)
  if (/^[A-Z]{3}$/.test(symbol)) {
    return `${formattedNumber} ${symbol}`;
  }

  return `${formattedNumber}${symbol}`;
}

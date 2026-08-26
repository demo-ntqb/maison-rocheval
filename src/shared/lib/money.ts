/**
 * The brand designs print amounts with a trailing currency symbol (`599.00€`)
 * rather than Intl's default leading placement for `en`.
 */
export function formatBrandPrice(
  amount: number,
  currencyCode: string,
  locale: string,
  { minimumFractionDigits = 2 }: { minimumFractionDigits?: number } = {},
): string {
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";
  const value = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 2,
    minimumFractionDigits,
  }).format(amount);
  const symbol = new Intl.NumberFormat(intlLocale, {
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    style: "currency",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currencyCode;

  return locale === "fr" ? `${value} ${symbol}` : `${value}${symbol}`;
}

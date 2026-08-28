import type { AppLocale, ShippingCountryCode } from "@/shared/types/region.type";

/**
 * Các thị trường Maison Rocheval đang giao hàng — khớp với allowlist:
 * Singapore (SG), France (FR), United States (US).
 *
 * `defaultLocale` là ngôn ngữ canonical gợi ý khi người dùng đổi quốc gia trong popup.
 * Tên quốc gia được dịch qua `regionDialog.countries.<code>` trong messages/*.
 */
export const SHIPPING_COUNTRIES: ReadonlyArray<{
  code: ShippingCountryCode;
  flag: string;
  defaultLocale: AppLocale;
}> = [
  { code: "SG", flag: "🇸🇬", defaultLocale: "en" },
  { code: "FR", flag: "🇫🇷", defaultLocale: "fr" },
  { code: "US", flag: "🇺🇸", defaultLocale: "en" },
];

/**
 * Ngôn ngữ hiển thị. Thứ tự khớp `routing.locales`; nhãn được dịch qua
 * `regionDialog.languages.<locale>` (luôn hiển thị theo ngôn ngữ UI hiện tại).
 */
export const LANGUAGE_OPTIONS: ReadonlyArray<AppLocale> = ["en", "fr"];

/** Quốc gia mặc định cho headless channel ban đầu. */
export const DEFAULT_SHIPPING_COUNTRY: ShippingCountryCode = "SG";

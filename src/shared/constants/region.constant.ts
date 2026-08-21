import type { AppLocale, ShippingCountryCode } from "@/shared/types/region.type";

/**
 * Tạm ẩn phần chuyển ngôn ngữ (header switcher + language field trong popup
 * region) trong khi site chỉ support EN. Đổi thành `true` để bật lại — không
 * cần đụng vào code ở nơi khác.
 */
export const LANGUAGE_SWITCHER_ENABLED = false;

/**
 * Các thị trường Maison Rocheval đang giao hàng — khớp với announcement bar
 * ("We currently only deliver to France and United States").
 *
 * `defaultLocale` là ngôn ngữ gợi ý khi người dùng đổi quốc gia trong popup;
 * người dùng vẫn có thể chọn ngôn ngữ khác.
 * Tên quốc gia được dịch qua `regionDialog.countries.<code>` trong messages/*.
 */
export const SHIPPING_COUNTRIES: ReadonlyArray<{
  code: ShippingCountryCode;
  flag: string;
  defaultLocale: AppLocale;
}> = [
  { code: "FR", flag: "🇫🇷", defaultLocale: "fr" },
  { code: "US", flag: "🇺🇸", defaultLocale: "en" },
];

/**
 * Ngôn ngữ hiển thị. Thứ tự khớp `routing.locales`; nhãn được dịch qua
 * `regionDialog.languages.<locale>` (luôn hiển thị theo ngôn ngữ UI hiện tại).
 */
export const LANGUAGE_OPTIONS: ReadonlyArray<AppLocale> = ["en", "fr"];

/** Quốc gia mặc định khi chưa có gợi ý nào từ locale hiện tại. */
export const DEFAULT_SHIPPING_COUNTRY: ShippingCountryCode = "FR";

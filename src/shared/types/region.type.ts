import type { routing } from "@/i18n/routing";

/** Một trong các locale được khai báo ở `src/i18n/routing.ts` ("en" | "fr"). */
export type AppLocale = (typeof routing.locales)[number];

/** Mã quốc gia giao hàng (ISO 3166-1 alpha-2) — xem `region.constant.ts`. */
export type ShippingCountryCode = "FR" | "US";

/**
 * Lựa chọn vùng/ngôn ngữ mà người dùng đã xác nhận trên thiết bị này.
 * Được lưu trong localStorage nên phải coi mọi field là untrusted khi đọc lại.
 */
export interface RegionPreference {
  countryCode: ShippingCountryCode;
  locale: AppLocale;
}

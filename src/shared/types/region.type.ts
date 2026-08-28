import type { AppLocale, RouteLocale, SupportedCountry } from "@/shared/types/commerce-context.type";

export type { AppLocale, RouteLocale };

/** Mã quốc gia giao hàng (ISO 3166-1 alpha-2) — xem `region.constant.ts`. */
export type ShippingCountryCode = SupportedCountry;

/** Lựa chọn vùng/ngôn ngữ được lưu trên thiết bị. */
export type RegionPreference = {
  routeLocale: RouteLocale;
};

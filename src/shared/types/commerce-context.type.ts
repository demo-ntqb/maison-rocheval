// TODO: Tạm ẩn 2 quốc gia FR và US
export type SupportedCountry = "SG"; // | "FR" | "US";
export type SupportedLanguage = "EN" | "FR";
export type AppLocale = "en" | "fr";

// TODO: Tạm ẩn 2 quốc gia FR và US
export type RouteLocale =
  | "en-sg"
  | "fr-sg";
  // | "en-fr"
  // | "fr-fr"
  // | "en-us"
  // | "fr-us";

export type CommerceContext = {
  routeLocale: RouteLocale;
  appLocale: AppLocale;
  country: SupportedCountry;
  language: SupportedLanguage;
};

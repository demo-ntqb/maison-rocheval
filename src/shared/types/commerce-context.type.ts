export type SupportedCountry = "FR" | "US" | "SG";
export type SupportedLanguage = "EN" | "FR";
export type AppLocale = "en" | "fr";

export type RouteLocale =
  | "en-fr"
  | "fr-fr"
  | "en-us"
  | "fr-us"
  | "en-sg"
  | "fr-sg";

export type CommerceContext = {
  routeLocale: RouteLocale;
  appLocale: AppLocale;
  country: SupportedCountry;
  language: SupportedLanguage;
};

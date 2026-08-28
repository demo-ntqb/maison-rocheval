import { defineRouting } from "next-intl/routing";

import { DEFAULT_ROUTE_LOCALE, ROUTE_LOCALES } from "@/shared/constants/commerce-context.constant";

export const routing = defineRouting({
  alternateLinks: false,
  locales: ROUTE_LOCALES,
  defaultLocale: DEFAULT_ROUTE_LOCALE,
  localePrefix: "always",
});

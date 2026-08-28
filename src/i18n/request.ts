import { getRequestConfig } from "next-intl/server";

import { getRouteLocale } from "./route-locale";
import { parseCommerceContext } from "@/shared/lib/commerce-context";

export default getRequestConfig(async () => {
  const routeLocale = await getRouteLocale();
  const { appLocale } = parseCommerceContext(routeLocale);

  return {
    locale: routeLocale,
    messages: (await import(`../../messages/${appLocale}.json`)).default,
  };
});

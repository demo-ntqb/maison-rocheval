import { getRequestConfig } from "next-intl/server";

import { getRouteLocale } from "./route-locale";

export default getRequestConfig(async () => {
  const locale = await getRouteLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

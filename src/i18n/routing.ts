import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // TODO: Tạm ẩn fr
  // locales: ["en", "fr"],
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

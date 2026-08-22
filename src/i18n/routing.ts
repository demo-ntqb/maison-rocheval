import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // locales: ["en", "fr"], // TODO: Tạm ẩn fr
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

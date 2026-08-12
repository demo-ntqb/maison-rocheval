import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Required by the Hydrogen/Next.js catalog cache (`use cache`, cacheTag,
  // cacheLife). Personalized cart/account reads will stay behind Suspense when
  // they are introduced so this does not opt the current pages into dynamic IO.
  cacheComponents: true,
};

export default withNextIntl(nextConfig);

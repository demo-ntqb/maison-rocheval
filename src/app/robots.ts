import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/constants/site.constant";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { allow: "/", userAgent: "*" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

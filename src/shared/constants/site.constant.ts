// Site-wide constants for Maison Rocheval
// Business info, navigation, social links — shared across every page

import { ROUTES } from "./route.constant";

const DEFAULT_SITE_URL = "https://maison-rocheval.com";

const rawSiteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_ORIGIN ||
  DEFAULT_SITE_URL;

export const SITE_URL = (
  rawSiteOrigin.startsWith("http://") || rawSiteOrigin.startsWith("https://")
    ? rawSiteOrigin
    : `https://${rawSiteOrigin}`
).replace(/\/+$/u, "");

export const SITE_DOMAIN = (() => {
  try {
    return new URL(SITE_URL).hostname;
  } catch {
    return "maison-rocheval.com";
  }
})();

export const businessInfo = {
  name: "Maison Rocheval",
  tagline: "",
  description: "",
  email: "",
  phone: "",
  locations: [] as Array<{ id: string; name: string; address: string }>,
};

// Navigation. Labels are translated (see `header.nav` / `footer.nav` in
// messages/*.json) and looked up by `id` — this only holds hrefs + ids.
export const navigation = {
  main: [
    { id: "about", href: ROUTES.ABOUT_BRAND },
    { id: "collection", href: ROUTES.ABOUT_PRODUCT },
  ],
  footer: {
    caviar: [
      { id: "amour", href: ROUTES.PRODUCT_DETAIL("amour") },
      { id: "lexpression", href: ROUTES.PRODUCT_DETAIL("lexpression") },
      { id: "harmonie", href: ROUTES.PRODUCT_DETAIL("harmonie") },
      { id: "oscietra", href: ROUTES.PRODUCT_DETAIL("oscietra") },
      { id: "kaluga", href: ROUTES.PRODUCT_DETAIL("kaluga") },
    ],
    brand: [
      { id: "about", href: ROUTES.ABOUT_BRAND },
      { id: "collection", href: ROUTES.ABOUT_PRODUCT },
      { id: "shop", href: ROUTES.PRODUCTS },
    ],
    care: [
      { id: "faq", href: ROUTES.FAQ },
      { id: "contact", href: ROUTES.CONTACT },
    ],
  },
};

// SEO & Open Graph. `title`/`description` are translated per-locale — see
// `metadata.root` in messages/*.json; this only holds locale-independent values.
export const seoDefaults = {
  keywords: [] as string[],
  image: "/images/og/default.jpg",
  twitterHandle: "",
};


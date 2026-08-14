// Site-wide constants for Maison Rocheval
// Business info, navigation, social links — shared across every page

const SITE_DOMAIN = "maison-rocheval.com";
export const SITE_URL = `https://${SITE_DOMAIN}`;

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
    { id: "about", href: "/about-the-brand" },
    { id: "collection", href: "/about-the-product" },
    { id: "shop", href: "/products" },
  ],
  footer: {
    caviar: [
      { id: "amour", href: "/products/amour" },
      { id: "lexpression", href: "/products/lexpression" },
      { id: "harmonie", href: "/products/harmonie" },
      { id: "oscietra", href: "/products/oscietra" },
      { id: "kaluga", href: "/products/kaluga" },
      { id: "collection", href: "/products" },
    ],
    brand: [
      { id: "about", href: "/about-the-brand" },
      { id: "collection", href: "/about-the-product" },
    ],
    care: [
      { id: "faq", href: "/faq" },
      { id: "contact", href: "/contact" },
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


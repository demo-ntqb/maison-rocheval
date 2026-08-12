// Site-wide constants for Maison Rocheval
// Business info, navigation, social links — shared across every page

export const SITE_NAME = "Maison Rocheval";
export const SITE_DOMAIN = "maison-rocheval.com";
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

// Social Media. `ariaLabel` is translated — see `footer.social` in messages/*.json.
export const socialLinks: Array<{ id: string; href: string; icon: string }> = [];

// SEO & Open Graph. `title`/`description` are translated per-locale — see
// `metadata.root` in messages/*.json; this only holds locale-independent values.
export const seoDefaults = {
  keywords: [] as string[],
  image: "/images/og/default.jpg",
  twitterHandle: "",
};

// Animations
export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  },
};

// Breakpoints
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

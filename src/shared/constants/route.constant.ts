export const ROUTES = {
  HOME: "/",
  ABOUT_BRAND: "/about-the-brand",
  ABOUT_PRODUCT: "/about-the-product",
  PRODUCTS: "/products",
  FAQ: "/faq",
  CONTACT: "/contact",
  PRIVACY_POLICY: "/privacy-policy",
  // PRODUCT_DETAIL: (handle: string) => `/products/${handle}` as const,
  PRODUCT_DETAIL: (handle: string) => `${ROUTES.ABOUT_PRODUCT}?tab=${handle}` as const,
} as const;

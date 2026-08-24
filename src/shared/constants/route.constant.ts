export const ROUTES = {
  HOME: "/",
  ABOUT_BRAND: "/the-maison",
  ABOUT_PRODUCT: "/the-collection",
  PRODUCTS: "/products",
  FAQ: "/faq",
  CONTACT: "/contact",
  PRIVACY_POLICY: "/privacy-policy",
  // PRODUCT_DETAIL: (handle: string) => `/products/${handle}` as const,
  PRODUCT_DETAIL: (handle: string) => `${ROUTES.ABOUT_PRODUCT}?tab=${handle}` as const,
} as const;

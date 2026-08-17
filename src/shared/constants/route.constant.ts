export const ROUTES = {
  HOME: "/",
  ABOUT_BRAND: "/about-the-brand",
  ABOUT_PRODUCT: "/about-the-product",
  PRODUCTS: "/products",
  FAQ: "/faq",
  CONTACT: "/contact",
  PRODUCT_DETAIL: (handle: string) => `/products/${handle}` as const,
} as const;

import { ProductCategory } from "./catalog.constant";

export const ROUTES = {
  HOME: "/",
  ABOUT_BRAND: "/the-maison",
  ABOUT_PRODUCT: "/the-collection",
  SHOP: "/shop",
  PRODUCTS: "/products",
  FAQ: "/faq",
  CONTACT: "/contact",
  PRIVACY_POLICY: "/privacy-policy",
  COLLECTION_TAB: (tab: string) => `${ROUTES.ABOUT_PRODUCT}?tab=${tab}` as const,
  PRODUCT_CATEGORY: (category: ProductCategory) => `/products/${category}` as const,
  PRODUCT_DETAIL: (category: ProductCategory, handle: string) => `/products/${category}/${handle}` as const,
} as const;

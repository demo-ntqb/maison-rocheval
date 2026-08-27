export const enum CatalogCollectionHandle {
  HOME_PAGE = "home-page",
  GIFT_SET = "gift-set",
  CAVIAR = "caviar",
}

export const enum CatalogProductType {
  CAVIAR = "Caviar",
  GIFT_SET = "Gift Set",
}

type CatalogMoney = {
  amount: string;
  currencyCode: string;
};

export type CatalogImage = {
  altText: string;
  height: number;
  url: string;
  width: number;
};

export type CatalogProductCard = {
  productType: CatalogProductType;
  availableForSale: boolean;
  description: string;
  short_description: string | null;
  handle: string;
  id: string;
  image: CatalogImage | null;
  notes: string;
  price: CatalogMoney;
  subtitle: string;
  title: string;
};

export type CatalogBundleComponent = {
  product: CatalogProductCard;
  variantId: string;
  quantity: number;
};

export type CatalogProductProfile = CatalogProductCard & {
  galleryImages: CatalogImage[];
};

export type CatalogVariant = {
  availableForSale: boolean;
  id: string;
  optionValue: string;
  price: CatalogMoney;
  sku: string;
};

export type CatalogPackagingOption = {
  availableForSale: boolean;
  description: string;
  id: string;
  name: string;
  personalizedMessage: boolean;
  priceModifier: number;
  variantId: string | null;
};

export type CatalogProductBaseDetail = CatalogProductProfile & {
  descriptionHtml: string;
  /** Rich text content for the "Product" accordion section */
  productRichText: string;
  /** Rich text content for the "Serving" accordion section */
  servingRichText: string;
  /** Rich text content for the "Delivery" accordion section */
  deliveryRichText: string;
  /** Rich text content for the "Gifting" accordion section */
  giftingRichText: string;
  packagingOptions: CatalogPackagingOption[];
  relatedProducts: CatalogProductCard[];
  variants: CatalogVariant[];
  composition?: readonly string[];
};

export type CatalogCaviarDetail = CatalogProductBaseDetail & {
  productType: CatalogProductType.CAVIAR;
};

export type CatalogGiftSetDetail = CatalogProductBaseDetail & {
  productType: CatalogProductType.GIFT_SET;
  /** What the set contains, from `custom.set_includes` metafield */
  setIncludes?: string;
  bundle?: {
    components: CatalogBundleComponent[];
  };
};

export type CatalogProductDetail = CatalogCaviarDetail | CatalogGiftSetDetail;

export type StorefrontMetafield = {
  key: string;
  references?: { nodes: StorefrontProduct[] } | null;
  type: string;
  value: string;
};

export type StorefrontMetaobject = {
  fields: Array<{ key: string; type: string; value: string }>;
  handle: string;
  type: string;
};

export type StorefrontProduct = {
  productType?: string;
  availableForSale: boolean;
  descriptionHtml: string;
  featuredImage: {
    altText: string | null;
    height: number | null;
    url: string;
    width: number | null;
  } | null;
  handle: string;
  id: string;
  images?: {
    nodes: Array<{
      altText: string | null;
      height: number | null;
      url: string;
      width: number | null;
    }>;
  };
  metafields: Array<StorefrontMetafield | null>;
  priceRange: { minVariantPrice: CatalogMoney };
  title: string;
  variants?: {
    nodes: Array<{
      availableForSale: boolean;
      id: string;
      metafield?: { value: string } | null;
      price: CatalogMoney;
      selectedOptions: Array<{ name: string; value: string }>;
      sku: string | null;
      title: string;
    }>;
  };
};

export type StorefrontPresentationOption = StorefrontMetaobject;

export type CollectionProductsQuery = {
  collection: { products: { nodes: StorefrontProduct[] } } | null;
};

export type ProductDetailQuery = {
  presentationBox: StorefrontProduct | null;
  presentationOptions: { nodes: StorefrontMetaobject[] };
  product: StorefrontProduct | null;
};

export type CatalogHandlesQuery = {
  collection: { products: { nodes: Array<{ handle: string }> } } | null;
};

export type StorefrontResult = { errors?: Array<{ message: string }> };

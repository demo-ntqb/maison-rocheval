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
  availableForSale: boolean;
  description: string;
  eyebrow: string;
  handle: string;
  id: string;
  image: CatalogImage | null;
  price: CatalogMoney;
  profile: string;
  species: string;
  title: string;
};

export type CatalogProductProfile = CatalogProductCard & {
  galleryImages: CatalogImage[];
  serving: string;
  speciesDescription: string;
  specs: {
    color: string;
    pearlSize: string;
    salt: string;
    tastingNotes: string;
  };
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

export type CatalogProductDetail = CatalogProductProfile & {
  delivery: {
    duration: string;
    shipping: string;
  };
  descriptionHtml: string;
  gifting: {
    addOns: string;
    box: string;
    message: string;
  };
  packagingOptions: CatalogPackagingOption[];
  relatedProducts: CatalogProductCard[];
  specs: CatalogProductProfile["specs"] & {
    ingredients: string;
    nutritionalData: string;
  };
  specsDescription: string;
  storage: string;
  shelfLife: string;
  variants: CatalogVariant[];
};

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

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
  productType: "Caviar" | "Gift Set";
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

export type CatalogSpeciesRef = {
  handle: string;
  scientificName: string;
  description: string;
  image: CatalogImage | null;
};

export type CatalogServingRef = {
  handle: string;
  recommendation: string;
  storage: string;
  shelfLife: string;
};

export type CatalogDeliveryRef = {
  handle: string;
  shipping: string;
  duration: string;
};

export type CatalogGiftingRef = {
  handle: string;
  box: string;
  message: string;
  addOns: string;
};

export type CatalogBundleComponent = {
  product: CatalogProductCard;
  variantId: string;
  quantity: number;
};

export type CatalogProductProfile = CatalogProductCard & {
  galleryImages: CatalogImage[];
  serving: string;
  speciesDescription: string;
  speciesImage: CatalogImage | null;
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

export type CatalogProductBaseDetail = CatalogProductProfile & {
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
  // Structured metaobjects
  speciesRef?: CatalogSpeciesRef;
  servingGuide?: CatalogServingRef;
  deliveryProfile?: CatalogDeliveryRef;
  giftingProfile?: CatalogGiftingRef;

  // Additional metafields from product YAML definitions
  pearlColour?: string; // e.g., "Dark grey to golden olive"
  saltContent?: number; // e.g., 3.5
  ingredients?: string; // detailed ingredient list
  shelfLifeDays?: number; // e.g., 28
  relatedProductsMeta?: string[]; // array of related product identifiers
  subtitle?: string; // e.g., "Perfect for your private tasting"
  shortDescription?: string; // short description text
  specsDescription: string;
  storage: string;
  shelfLife: string;
  variants: CatalogVariant[];
};

export type CatalogCaviarDetail = CatalogProductBaseDetail & {
  productType: "Caviar";
};

export type CatalogGiftSetDetail = CatalogProductBaseDetail & {
  productType: "Gift Set";
  bundle?: {
    components: CatalogBundleComponent[];
  };
  /**
   * Identifiers of what the set contains, in presentation order — either a
   * caviar handle (`amour`) or an accessory code (`spoons_2`, `key_1`). Each
   * one resolves to a label through the `productDetail.composition` messages.
   */
  composition?: readonly string[];
};

export type CatalogProductDetail = CatalogCaviarDetail | CatalogGiftSetDetail;

export type StorefrontMetafield = {
  key: string;
  reference?: {
    image?: {
      altText: string | null;
      height: number | null;
      url: string;
      width: number | null;
    } | null;
  } | null;
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

import type { CatalogImage, CatalogPackagingOption, CatalogProductCard, CatalogProductDetail, CatalogVariant } from "./shopify/catalog-mapper";

export const PRODUCT_CATEGORIES = ["gift-sets", "caviar"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type MockVariant = {
  id: string;
  label: string;
  price: number;
};

export type MockProduct = {
  id: string;
  category: ProductCategory;
  handle: string;
  title: string;
  subtitle: string;
  profile: string;
  shortDescription: string;
  description: string;
  price: number;
  currency: "EUR";
  image: string;
  imageAlt: string;
  gallery: readonly string[];
  variants: readonly MockVariant[];
  availability: boolean;
  details: {
    product: string;
    serving: string;
    delivery: string;
    gifting: string;
  };
  seo: { title: string; description: string };
  readonly composition?: readonly string[];
};

const caviar = (handle: string, title: string, subtitle: string, profile: string, price: number): MockProduct => ({
  id: `caviar-${handle}`,
  category: "caviar",
  handle,
  title,
  subtitle,
  profile,
  shortDescription: "Pearls selected for a precise texture and a long, clean finish.",
  description: "A Maison Rocheval selection with a supple grain, elegant salinity and a finish that develops slowly on the palate.",
  price,
  currency: "EUR",
  image: `/images/products/caviar/${handle}.png`,
  imageAlt: `${title} caviar tin by Maison Rocheval`,
  gallery: [
    `/images/products/caviar/${handle}.png`,
    "/images/products/caviar-back.png",
    "/images/products/caviar-serving.png"
  ],
  variants: [
    { id: `${handle}-30`, label: "30g", price },
    { id: `${handle}-50`, label: "50g", price: price + 35 },
    { id: `${handle}-125`, label: "125g", price: price + 120 },
  ],
  availability: true,
  details: {
    product: `${subtitle}. ${profile}.`,
    serving: "Serve chilled, with a mother-of-pearl spoon, on a bed of ice.",
    delivery: "Packed in an insulated box and dispatched by express delivery.",
    gifting: "A Maison Rocheval presentation box and personal message are available.",
  },
  seo: { title: `${title} caviar`, description: `Discover ${title}, ${profile.toLowerCase()}.` },
});

const gift = (handle: string, title: string, profile: string, price: number, composition: readonly string[], variants: readonly MockVariant[]): MockProduct => ({
  id: `gift-${handle}`,
  category: "gift-sets",
  handle,
  title,
  subtitle: "Maison Rocheval gift set",
  profile,
  shortDescription: "A composed caviar ritual, presented ready to give.",
  description: "An invitation to share the Maison Rocheval ritual, assembled in a signature presentation box.",
  price,
  currency: "EUR",
  image: `/images/products/gift-sets/${handle}.png`,
  imageAlt: `${title} gift set by Maison Rocheval`,
  gallery: [
    `/images/products/gift-sets/${handle}.png`,
    "/images/products/gift-sets-back.png",
    "/images/products/gift-sets-serving.png"
  ],
  variants,
  availability: true,
  details: {
    product: "A curated composition of caviar and service pieces in a Maison Rocheval box.",
    serving: "Chill the caviar before opening; each set includes a serving suggestion.",
    delivery: "Packed in an insulated box and dispatched by express delivery.",
    gifting: "A personal message is included; choose the occasion-ready composition you prefer.",
  },
  seo: { title: `${title} gift set`, description: `Discover ${title}, a Maison Rocheval caviar gift set.` },
  composition,
});

export const mockCatalog = [
  caviar("amour", "Amour", "Acipenser baerii", "Rich, creamy, long finish", 75),
  caviar("lexpression", "L’Expression", "Acipenser gueldenstaedtii", "Nutty, refined, mineral", 98),
  caviar("harmonie", "Harmonie", "Acipenser baerii", "Delicate, silky, balanced", 82),
  caviar("oscietra", "Oscietra", "Acipenser gueldenstaedtii", "Complex, marine, persistent", 110),
  caviar("kaluga", "Kaluga", "Huso dauricus", "Buttery, generous, elegant", 105),
  gift(
    "linitiation",
    "L’Initiation",
    "A first introduction to the Maison",
    599,
    ["amour", "lexpression", "harmonie", "spoons_2", "key_1"],
    [
      { id: "linitiation-30", label: "L’Initiation, Three 30g Tins", price: 599 },
      { id: "linitiation-50", label: "L’Initiation, Three 50g Tins", price: 749 },
    ]
  ),
  gift(
    "lexcellence",
    "L’Excellence",
    "A refined ritual for two",
    420,
    ["lexpression", "oscietra", "spoons_2", "key_1"],
    [
      { id: "lexcellence-50", label: "L’Excellence, Two 50g Tins", price: 420 },
      { id: "lexcellence-125", label: "L’Excellence, Two 125g Tins", price: 580 },
    ]
  ),
  gift(
    "lopulence",
    "L’Opulence",
    "A generous celebration collection",
    690,
    ["kaluga", "oscietra", "harmonie", "spoons_4", "key_1"],
    [
      { id: "lopulence-50", label: "L’Opulence, Three 50g Tins", price: 690 },
      { id: "lopulence-125", label: "L’Opulence, Three 125g Tins", price: 950 },
    ]
  ),
] as const satisfies readonly MockProduct[];

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

export function getProductsByCategory(category: ProductCategory): readonly MockProduct[] {
  return mockCatalog.filter((product) => product.category === category);
}

export function getMockProduct(category: ProductCategory, handle: string): MockProduct | undefined {
  return mockCatalog.find((product) => product.category === category && product.handle === handle);
}

export function getMockProductByHandle(handle: string): MockProduct | undefined {
  return mockCatalog.find((product) => product.handle === handle);
}

export function getMockStaticParams() {
  return mockCatalog.map(({ category, handle }) => ({ category, handle }));
}

export function mapMockToCatalogCard(mock: MockProduct): CatalogProductCard {
  return {
    productType: mock.category === "gift-sets" ? "Gift Set" : "Caviar",
    availableForSale: mock.availability,
    description: mock.shortDescription,
    eyebrow: mock.category === "caviar" ? "Patrimoine" : "",
    handle: mock.handle,
    id: mock.id,
    image: {
      url: mock.image,
      altText: mock.imageAlt,
      width: 624,
      height: 624,
    },
    price: {
      amount: String(mock.price),
      currencyCode: mock.currency,
    },
    profile: mock.profile,
    species: mock.category === "caviar" ? mock.subtitle : "",
    title: mock.title,
  };
}

export function mapMockToProductDetail(mock: MockProduct): CatalogProductDetail {
  const money = (amount: number) => ({
    amount: String(amount),
    currencyCode: mock.currency,
  });

  const variants: CatalogVariant[] = mock.variants.map((v) => ({
    availableForSale: mock.availability,
    id: v.id,
    optionValue: v.label,
    price: money(v.price),
    sku: v.id,
  }));

  const galleryImages: CatalogImage[] = mock.gallery.map((url) => ({
    url,
    altText: mock.imageAlt,
    width: 1200,
    height: 1200,
  }));

  const packagingOptions: CatalogPackagingOption[] = [
    {
      availableForSale: true,
      description: "Standard packaging",
      id: "standard",
      name: "Standard",
      personalizedMessage: false,
      priceModifier: 0,
      variantId: null,
    },
    {
      availableForSale: true,
      description: "Premium presentation box with a personal card",
      id: "premium",
      name: "Premium",
      personalizedMessage: true,
      priceModifier: 35,
      variantId: `${mock.handle}-premium-packaging`,
    },
  ];

  const base = {
    availableForSale: mock.availability,
    description: mock.shortDescription,
    descriptionHtml: `<p>${mock.description}</p>`,
    eyebrow: mock.category === "caviar" ? "Patrimoine" : "Coffret",
    handle: mock.handle,
    id: mock.id,
    image: {
      url: mock.image,
      altText: mock.imageAlt,
      width: 624,
      height: 624,
    },
    price: money(mock.price),
    profile: mock.profile,
    species: mock.category === "caviar" ? mock.subtitle : "",
    title: mock.title,
    galleryImages,
    serving: mock.details.serving,
    speciesDescription: mock.description,
    specsDescription: mock.description,
    speciesImage: null,
    specs: {
      color: mock.category === "caviar" ? "Dark olive to golden amber" : "",
      pearlSize: mock.category === "caviar" ? "2.8mm - 3.2mm" : "",
      salt: mock.category === "caviar" ? "3.5%" : "",
      tastingNotes: mock.profile,
      ingredients: mock.category === "caviar" ? "Sturgeon roe (Acipenser baerii/gueldenstaedtii), salt (3.5%), preservative: E285" : "See individual products",
      nutritionalData: "Energy: 254 kcal. Fat: 16g (saturated: 4.1g). Carbohydrates: 1.1g. Protein: 26g.",
    },
    delivery: {
      duration: "1-2 business days (Overnight dispatch available)",
      shipping: "Insulated cold chain express shipping",
    },
    gifting: {
      addOns: "Mother-of-pearl spoons, tin opener, chill pack",
      box: "Signature Maison Rocheval presentation box",
      message: "Personalized card with a golden seal",
    },
    packagingOptions,
    relatedProducts: [],
    storage: "Keep refrigerated between -2°C and +2°C",
    shelfLife: "Consumable within 4 weeks of delivery (see tin expiry date)",
    subtitle: mock.subtitle,
    shortDescription: mock.shortDescription,
    variants,
  };

  if (mock.category === "gift-sets") {
    return { ...base, productType: "Gift Set", composition: mock.composition ?? [] };
  }

  return { ...base, productType: "Caviar" };
}

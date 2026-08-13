import { VARIETIES } from "@/shared/constants/shop.constant";
import type { DetailedProduct, PackagingOption } from "../types/product-detail.type";

export const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Paper bag with ice",
    priceModifier: 0,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Quality cardboard box with Bolduc ribbon.",
    priceModifier: 32,
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium wooden box with Bolduc ribbon.",
    priceModifier: 74,
  },
];

export const DEFAULT_SIZES = ["30g", "50g", "125g", "250g"];
export const DEFAULT_PER_BOX = [1, 2, 3, 4];

export const DEFAULT_PRODUCT_DETAIL: DetailedProduct = {
  ...VARIETIES[1], // Kaluga Caviar as baseline
  price: 599.00,
  bestSeller: true,
  galleryImages: [
    VARIETIES[1].imageBasePath,
    "/images/about-product/species-amur",
    "/images/about-product/product-sturgeon",
  ],
  sizes: DEFAULT_SIZES,
  packagingOptions: PACKAGING_OPTIONS,
  perBoxOptions: DEFAULT_PER_BOX,
  specsDescription: "Kaluga-Huso is the rising star of the caviar world; a naturally-occurring hybrid that combines the rich flavors of Beluga caviar with a clean, buttery burst, firm beads and a velvet finish that never ends. If you prefer butter to brine, this decadent masterpiece is perfect for you and your loved ones.",
  specs: {
    pearlSize: "3.2mm - 3.8mm",
    salt: "3.0% - 3.5%",
    color: "Golden",
    tastingNotes: "Rich - Creamy - Long finish",
    ingredients: "STURGEON ROE (Acipenser Dauricus), salt, E285",
    nutritionalData: "Energy 1059 kJ/ 254kcal, Fat: 16,0g, Carbohydrates: 1,0g, Protein: 0.8g and Salt: 3.5g",
  },
  servingInfo: {
    shelfLife: "Four weeks refrigerated",
    recommendation: "Serve ideally between 26-32°F.\n\nPlan for about 1 ounce (28 grams) per person for a generous tasting.\n\nMother of Pearl Spoon and chilled glass or crystal bowls.\n(Please note that metal spoons can alter the taste of caviar.)",
  },
  deliveryInfo: {
    shipping: "Perishable shipping is handled with insulated packaging and careful temperature control.",
    deliveryTime: "1-3 business days in Metropolitan France and select international destinations.",
  },
  giftingInfo: {
    wrapping: "Signature Maison Rocheval gift wrapping included with ribbon finish.",
    message: "Complimentary handwritten message card available at checkout.",
  },
  accordionItems: [
    {
      id: "specification",
      title: "Specification",
      content: `<p class="mb-4 text-sm leading-relaxed">Kaluga-Huso is the rising star of the caviar world; a naturally-occurring hybrid that combines the rich flavors of Beluga caviar with a clean, buttery burst, firm beads and a velvet finish that never ends. If you prefer butter to brine, this decadent masterpiece is perfect for you and your loved ones.</p>
<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between gap-4 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Pearl Size</span><span class="font-sans text-xs text-black">3.2mm - 3.8mm</span></div>
  <div class="flex items-center justify-between gap-4 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Salt Content</span><span class="font-sans text-xs text-black">3.0% - 3.5%</span></div>
  <div class="flex items-center justify-between gap-4 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Color</span><span class="font-sans text-xs text-black">Golden</span></div>
  <div class="flex items-center justify-between gap-4 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Tasting Notes</span><span class="font-sans text-xs text-black">Rich - Creamy - Long finish</span></div>
  <div class="flex flex-col gap-1 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Ingredients</span><span class="font-sans text-xs text-black">STURGEON ROE (Acipenser Dauricus), salt, E285</span></div>
  <div class="flex flex-col gap-1"><span class="font-display text-xs font-bold uppercase text-black">Nutritional Data</span><span class="font-sans text-xs text-black">Energy 1059 kJ/ 254kcal, Fat: 16.0g, Carbohydrates: 1.0g, Protein: 0.8g and Salt: 3.5g</span></div>
</div>`,
    },
    {
      id: "serving",
      title: "Serving & Storage",
      content: `<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Shelf Life</span><span class="font-sans text-xs text-black">Four weeks refrigerated</span></div>
  <div class="flex flex-col gap-1"><span class="font-display text-xs font-bold uppercase text-black">Recommendation</span><p class="whitespace-pre-line font-sans text-xs text-black">Serve ideally between 26-32°F.<br/><br/>Plan for about 1 ounce (28 grams) per person for a generous tasting.<br/><br/>Mother of Pearl Spoon and chilled glass or crystal bowls.<br/><em>(Please note that metal spoons can alter the taste of caviar.)</em></p></div>
</div>`,
    },
    {
      id: "delivery",
      title: "Delivery & Returns",
      content: `<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Shipping</span><span class="font-sans text-xs text-black">Perishable shipping is handled with insulated packaging and careful temperature control.</span></div>
  <div class="flex flex-col gap-1"><span class="font-display text-xs font-bold uppercase text-black">Delivery Time</span><span class="font-sans text-xs text-black">1-3 business days in Metropolitan France and select international destinations.</span></div>
</div>`,
    },
    {
      id: "gifting",
      title: "Gifting & Presentation",
      content: `<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 pb-4"><span class="font-display text-xs font-bold uppercase text-black">Gift Wrapping</span><span class="font-sans text-xs text-black">Signature Maison Rocheval gift wrapping included with ribbon finish.</span></div>
  <div class="flex flex-col gap-1"><span class="font-display text-xs font-bold uppercase text-black">Message Card</span><span class="font-sans text-xs text-black">Complimentary handwritten message card available at checkout.</span></div>
</div>`,
    },
  ],
};

export function getProductDetail(handle: string): DetailedProduct {
  const base = VARIETIES.find((v) => v.handle === handle) ?? VARIETIES[1];
  return {
    ...DEFAULT_PRODUCT_DETAIL,
    ...base,
    galleryImages: [
      base.imageBasePath,
      "/images/about-product/species-amur",
      "/images/about-product/product-sturgeon",
    ],
  };
}

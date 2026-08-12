import { Product } from "@/shared/components/composite/product-card";

export const VARIETIES: Product[] = [
  {
    id: "prod_amur",
    handle: "caviar-amur",
    title: "Amur Caviar",
    price: 120.0,
    currencyCode: "EUR",
    imageUrl: "/images/products/amur.webp",
    imageAlt: "Maison Rocheval Amur Caviar Gold Tin",
    rating: 3,
    description: "Exceptional pearls from the Amur river basin. Dark grey to golden olive, offering a complex walnut and creamy texture finish.",
  },
  {
    id: "prod_kaluga",
    handle: "caviar-kaluga",
    title: "Kaluga Caviar",
    price: 180.0,
    currencyCode: "EUR",
    imageUrl: "/images/products/kaluga.webp",
    imageAlt: "Maison Rocheval Kaluga Caviar Gold Tin",
    rating: 3,
    description: "Known as the river beluga. Extra-large pearls with warm bronze reflections, rich butter and oceanic notes.",
  },
  {
    id: "prod_hybrid",
    handle: "caviar-russian-hybrid",
    title: "Russian Hybrid Caviar",
    price: 95.0,
    currencyCode: "EUR",
    imageUrl: "/images/products/russian-hybrid.webp",
    imageAlt: "Maison Rocheval Russian Hybrid Caviar Gold Tin",
    rating: 3,
    description: "A refined crossing of Acipenser gueldenstaedtii and baerii. Intense olive pearls with a brilliant, robust saline finish.",
  },
];

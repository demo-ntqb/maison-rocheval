"use client";

import { useTranslations } from "next-intl";

import { ProductCard } from "@/shared/components/composite/product-card";
import { HOME_PRODUCTS } from "../constants/home.constant";

export function HomeProductList() {
  const t = useTranslations("home.products");

  return (
    <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3 justify-items-center" data-plumb-id="component-6-4">
      {HOME_PRODUCTS.map((p) => {
        const productData = {
          id: p.id,
          handle: p.handle,
          title: t(`cards.${p.id}.title`),
          imageBasePath: p.imagePath,
          imageAlt: t(`cards.${p.id}.imageAlt`),
          // eyebrow: t(`cards.${p.id}.eyebrow`),
          species: t(`cards.${p.id}.species`),
          profile: t(`cards.${p.id}.profile`),
          description: t(`cards.${p.id}.description`),
        };

        return (
          <ProductCard
            key={p.id}
            product={productData}
            size="sm"
          />
        );
      })}
    </div>
  );
}

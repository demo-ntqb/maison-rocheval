"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import type { CatalogImage } from "@/shared/types/catalog.type";

export interface ProductDetailGalleryProps {
  images: readonly CatalogImage[];
  title: string;
}

export function ProductDetailGallery({ images, title }: ProductDetailGalleryProps) {
  const t = useTranslations("productDetail");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="aspect-square w-full overflow-hidden bg-surface-3">
        <ShopifyImage
          key={activeImage.url}
          image={{ ...activeImage, altText: `${title} — ${activeImage.altText}` }}
          priority
          sizes="(max-width: 1023px) 100vw, 596px"
          className="size-full object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-row flex-wrap gap-4">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                aria-label={t("selectImageIndexed", { index: index + 1, title })}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className="block size-20 cursor-pointer overflow-hidden bg-surface-3 outline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-navy-darker"
              >
                <ShopifyImage
                  image={{ ...image, altText: "" }}
                  responsiveWidths={[200, 320]}
                  sizes="80px"
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

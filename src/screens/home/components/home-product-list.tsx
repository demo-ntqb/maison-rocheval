"use client";

import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";

import { ProductCard } from "@/shared/components/composite/product-card";
import { IconButton } from "@/shared/components/ui/icon-button";
import type { CatalogProductCard } from "@/shared/lib/shopify/catalog-mapper";

import { IconCaretLeft, IconCaretRight } from "@/shared/components/icons";

export function HomeProductList({ products }: { products: CatalogProductCard[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      containScroll: "trimSnaps",
      dragFree: true,
      loop: false,
    }
  );

  const [prevBtnEnabled, setPrevBtnEnabled] = React.useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = React.useState(false);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Sync state asynchronously in the next tick to prevent cascading render warnings
    const t = setTimeout(onSelect, 0);

    return () => {
      clearTimeout(t);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <div
      className="flex flex-col lg:flex-row items-center w-full min-w-0 lg:max-w-249 xl:max-w-273 justify-between relative lg:gap-3.5"
      data-plumb-id="component-6-3"
    >
      {/* Left button (Desktop - hidden on mobile) */}
      <IconButton
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        className="hidden lg:flex"
        data-plumb-id="icon-button"
        aria-label="Previous slide"
      >
        <IconCaretLeft />
      </IconButton>

      {/* Viewport container */}
      <div
        className="w-full min-w-0 lg:w-[904px] xl:w-250 overflow-hidden"
        ref={emblaRef}
        data-plumb-id="frame-2085667295"
      >
        <div className="flex gap-6 lg:gap-8 px-4 lg:px-0">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_auto]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Right button (Desktop - hidden on mobile) */}
      <IconButton
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className="hidden lg:flex"
        data-plumb-id="icon-button-2"
        aria-label="Next slide"
      >
        <IconCaretRight />
      </IconButton>

      {/* Mobile buttons group (Bottom - hidden on desktop) */}
      <div
        className="flex lg:hidden justify-center mt-12 gap-4 h-11 w-26"
        data-plumb-id="frame-2085667302"
      >
        <IconButton
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          className="flex size-11 [&_svg]:size-8"
          data-plumb-id="icon-button"
          aria-label="Previous slide"
        >
          <IconCaretLeft />
        </IconButton>
        <IconButton
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          className="flex size-11 [&_svg]:size-8"
          data-plumb-id="icon-button-2"
          aria-label="Next slide"
        >
          <IconCaretRight />
        </IconButton>
      </div>
    </div>
  );
}

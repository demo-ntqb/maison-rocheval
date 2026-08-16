"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";

import { ProductCard } from "@/shared/components/composite/product-card";
import type { CatalogProductCard } from "@/shared/lib/shopify/catalog-mapper";
import { cn } from "@/shared/lib/utils";

const LeftArrow = () => (
  <svg width="9" height="16" viewBox="0 0 9 16" fill="none" className="shrink-0 text-ink">
    <path d="M8 1L1 8L8 15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RightArrow = () => (
  <svg width="9" height="16" viewBox="0 0 9 16" fill="none" className="shrink-0 text-ink">
    <path d="M1 1L8 8L1 15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function HomeProductList({ products }: { products: CatalogProductCard[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      containScroll: "trimSnaps",
      dragFree: false,
      loop: false,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
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
      className="flex flex-col lg:flex-row items-center w-full max-w-[1000px] justify-between relative"
      data-plumb-id="component-6-3"
    >
      {/* Left button (Desktop - hidden on mobile) */}
      <button
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        className={cn(
          "hidden lg:flex size-8 items-center justify-center rounded-[2px] transition-opacity",
          !prevBtnEnabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer opacity-100 hover:opacity-80"
        )}
        data-plumb-id="icon-button"
        aria-label="Previous slide"
      >
        <LeftArrow />
      </button>

      {/* Viewport container */}
      <div
        className="w-full lg:w-[904px] overflow-hidden"
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
      <button
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className={cn(
          "hidden lg:flex size-8 items-center justify-center rounded-[2px] transition-opacity",
          !nextBtnEnabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer opacity-100 hover:opacity-80"
        )}
        data-plumb-id="icon-button-2"
        aria-label="Next slide"
      >
        <RightArrow />
      </button>

      {/* Mobile buttons group (Bottom - hidden on desktop) */}
      <div
        className="flex lg:hidden justify-center mt-12 gap-4 h-11 w-26"
        data-plumb-id="frame-2085667302"
      >
        <button
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          className={cn(
            "flex size-11 items-center justify-center rounded-[2px]",
            !prevBtnEnabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer opacity-100 hover:opacity-80"
          )}
          data-plumb-id="icon-button"
          aria-label="Previous slide"
        >
          <LeftArrow />
        </button>
        <button
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          className={cn(
            "flex size-11 items-center justify-center rounded-[2px]",
            !nextBtnEnabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer opacity-100 hover:opacity-80"
          )}
          data-plumb-id="icon-button-2"
          aria-label="Next slide"
        >
          <RightArrow />
        </button>
      </div>
    </div>
  );
}

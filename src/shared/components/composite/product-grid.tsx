"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Product, ProductCard } from "./product-card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ProductGridProps extends React.ComponentProps<"div"> {
  products: Product[];
  layoutType?: "grid" | "slider";
}

export function ProductGrid({
  products,
  layoutType = "grid",
  className,
  ...props
}: ProductGridProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Xử lý scroll trượt ngang cho dạng slider
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75; // Cuộn 75% chiều rộng khung nhìn
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (layoutType === "slider") {
    return (
      <div
        data-slot="product-slider"
        className={cn("relative w-full max-w-[1000px]", className)}
        {...props}
      >
        {/* Navigation Buttons */}
        <div className="absolute -top-16 right-0 flex items-center gap-4">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex size-10 items-center justify-center rounded-full border border-gray-light bg-white text-black transition-colors hover:border-black hover:bg-offwhite active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex size-10 items-center justify-center rounded-full border border-gray-light bg-white text-black transition-colors hover:border-black hover:bg-offwhite active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Horizontal Scroll Area */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-none flex w-full gap-8 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="snap-start shrink-0 w-[284px]"
            >
              <ProductCard product={product} size="sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dạng Grid 3 cột
  return (
    <div
      data-slot="product-grid"
      className={cn(
        "grid w-full max-w-[1000px] grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16",
        className
      )}
      {...props}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} size="md" className="justify-self-center" />
      ))}
    </div>
  );
}

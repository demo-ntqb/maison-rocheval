"use client";

import { useState, type MouseEvent } from "react";

import type { CarouselApi } from "@/shared/components/ui/carousel";
import type { CatalogImage } from "@/shared/lib/shopify/catalog-mapper";
import { useProductDetailCarouselSelection } from "../hooks/product-detail-gallery.hook";
import { ProductDetailGalleryCarousel } from "./product-detail-gallery-carousel";
import { ProductDetailGalleryDialog } from "./product-detail-gallery-dialog";

export interface ProductDetailImageGalleryProps {
  bestSeller?: boolean;
  images: CatalogImage[];
  title: string;
}

export function ProductDetailImageGallery({ bestSeller = false, images, title }: ProductDetailImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const { activeIndex, selectImage } = useProductDetailCarouselSelection(api);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setIsZoomed(false);
  };
  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((event.clientX - left) / width) * 100,
      y: ((event.clientY - top) / height) * 100,
    });
  };

  return (
    <div className="flex w-full flex-col">
      <ProductDetailGalleryCarousel activeIndex={activeIndex} bestSeller={bestSeller} images={images} onOpen={() => setIsDialogOpen(true)} onSelect={selectImage} setApi={setApi} title={title} />
      <ProductDetailGalleryDialog image={images[activeIndex] ?? images[0]} isZoomed={isZoomed} onMove={handleMouseMove} onOpenChange={handleDialogChange} onToggleZoom={() => setIsZoomed((current) => !current)} open={isDialogOpen} position={zoomPosition} title={title} />
    </div>
  );
}

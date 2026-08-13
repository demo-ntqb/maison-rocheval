"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { Image } from "@shopify/hydrogen";
import { Maximize2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/shared/components/ui/carousel";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Picture } from "@/shared/components/ui/picture";
import { cn } from "@/shared/lib/utils";

export interface ProductDetailImageGalleryProps {
  images: (string | Record<string, unknown>)[];
  title: string;
  bestSeller?: boolean;
}

function GalleryImage({
  image,
  alt,
  priority = false,
  sizes,
  width,
  height,
  className,
}: {
  image: string | Record<string, unknown>;
  alt: string;
  priority?: boolean;
  sizes: string;
  width: number;
  height: number;
  className?: string;
}) {
  const isShopifyImage = typeof image === "object" && image !== null && "url" in image;

  if (isShopifyImage) {
    return (
      <Image
        data={image}
        sizes={sizes}
        alt={alt}
        className={cn("size-full object-contain", className)}
      />
    );
  }

  const isRemoteString = typeof image === "string" && image.startsWith("http");
  if (isRemoteString) {
    return (
      <img
        src={image}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        width={width}
        height={height}
        sizes={sizes}
        className={cn("size-full object-contain", className)}
      />
    );
  }

  return (
    <Picture
      basePath={image as string}
      fallbackExtension="png"
      alt={alt}
      priority={priority}
      width={width}
      height={height}
      sizes={sizes}
      pictureClassName="block size-full"
      className={cn("size-full object-contain", className)}
    />
  );
}

export function ProductDetailImageGallery({
  images,
  title,
  bestSeller = false,
}: ProductDetailImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Update active state from Carousel API
  useEffect(() => {
    if (!api) return;

    setActiveIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Sync variant selections
  useEffect(() => {
    if (!api) return;

    const handleVariantChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { size, packaging } = customEvent.detail;
      let targetIndex = 0;
      if (packaging === "premium" || size === "125g") {
        targetIndex = Math.min(1, images.length - 1);
      } else if (packaging === "luxury" || size === "250g") {
        targetIndex = Math.min(2, images.length - 1);
      }
      api.scrollTo(targetIndex);
    };

    window.addEventListener("product-variant-changed", handleVariantChange);
    return () => {
      window.removeEventListener("product-variant-changed", handleVariantChange);
    };
  }, [api, images.length]);

  // Zoom handling in Fullscreen Dialog
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleThumbnailClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  const activeImage = images[activeIndex] || images[0];

  return (
    <div className="flex w-full flex-col">
      {/* Main Gallery Area */}
      <Carousel setApi={setApi} className="relative w-full">
        {bestSeller && (
          <span className="absolute left-4 top-4 z-10 rounded-sm bg-navy-dark px-4 py-2 font-sans text-xs font-medium text-white shadow-sm">
            Best Seller
          </span>
        )}

        <CarouselContent>
          {images.map((imagePath, index) => (
            <CarouselItem key={index} className="relative aspect-square w-full">
              <div
                onClick={() => setIsDialogOpen(true)}
                className="group relative size-full cursor-zoom-in rounded-sm bg-warm p-8 md:p-12 transition-colors duration-300"
              >
                <GalleryImage
                  image={imagePath}
                  alt={`Main view of ${title}`}
                  priority={index === 0}
                  width={600}
                  height={600}
                  sizes="(max-width: 1023px) 100vw, 546px"
                />
                {/* Maximize Icon on Hover */}
                <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/80 text-black shadow-sm backdrop-blur-xs">
                    <Maximize2 className="size-4" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Thumbnails Row */}
      <div className="mt-4 flex flex-row gap-4">
        {images.map((imagePath, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "group relative size-25 cursor-pointer overflow-hidden rounded-sm border p-2 transition-all duration-300 bg-warm",
                isActive
                  ? "border-black scale-[1.02]"
                  : "border-transparent hover:border-black/40"
              )}
            >
              <GalleryImage
                image={imagePath}
                alt={`${title} detail view ${index + 1}`}
                width={200}
                height={200}
                sizes="100px"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          );
        })}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setIsZoomed(false);
      }}>
        <DialogContent className="border-none bg-transparent p-0 shadow-none w-full sm:max-w-150">
          <div className="flex flex-col items-center justify-center w-full aspect-square">
            {/* Motion container for opening transition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-square w-full max-w-150 overflow-hidden rounded-sm bg-warm p-6"
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed((prev) => !prev)}
            >
              <div
                className={cn(
                  "size-full select-none transition-transform ease-out",
                  isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: isZoomed ? "scale(2.5)" : "scale(1)",
                  transitionDuration: isZoomed ? "100ms" : "300ms",
                }}
              >
                <GalleryImage
                  image={activeImage}
                  alt={`Fullscreen view of ${title}`}
                  priority
                  width={800}
                  height={800}
                  sizes="(max-width: 768px) 90vw, 600px"
                />
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


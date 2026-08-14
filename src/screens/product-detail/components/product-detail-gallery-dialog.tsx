import { motion } from "motion/react";
import type { MouseEvent } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import type { CatalogImage } from "@/shared/lib/shopify/catalog-mapper";
import { cn } from "@/shared/lib/utils";
import { ProductDetailGalleryImage } from "./product-detail-gallery-image";

type ZoomPosition = Readonly<{ x: number; y: number }>;

function ZoomableImage({ image, isZoomed, onMove, onToggle, position, title }: {
  image: CatalogImage;
  isZoomed: boolean;
  onMove: (event: MouseEvent<HTMLButtonElement>) => void;
  onToggle: () => void;
  position: ZoomPosition;
  title: string;
}) {
  return (
    <button type="button" aria-label={`${isZoomed ? "Zoom out" : "Zoom in"} ${title}`} aria-pressed={isZoomed} onMouseMove={onMove} onClick={onToggle} className={cn("size-full select-none", isZoomed ? "cursor-zoom-out" : "cursor-zoom-in")}>
      <span className="block size-full transition-transform ease-out" style={{
        transform: isZoomed ? "scale(2.5)" : "scale(1)",
        transformOrigin: `${position.x}% ${position.y}%`,
        transitionDuration: isZoomed ? "100ms" : "300ms",
      }}>
        <ProductDetailGalleryImage image={image} alt={`Fullscreen view of ${title}`} priority sizes="(max-width: 768px) 90vw, 600px" />
      </span>
    </button>
  );
}

export function ProductDetailGalleryDialog({ image, isZoomed, onMove, onOpenChange, onToggleZoom, open, position, title }: {
  image: CatalogImage | undefined;
  isZoomed: boolean;
  onMove: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpenChange: (open: boolean) => void;
  onToggleZoom: () => void;
  open: boolean;
  position: ZoomPosition;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full border-none bg-transparent p-0 shadow-none sm:max-w-150">
        <DialogTitle className="sr-only">{title} image viewer</DialogTitle>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="relative aspect-square w-full max-w-150 overflow-hidden rounded-sm bg-warm p-6">
          {image ? <ZoomableImage image={image} isZoomed={isZoomed} onMove={onMove} onToggle={onToggleZoom} position={position} title={title} /> : null}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

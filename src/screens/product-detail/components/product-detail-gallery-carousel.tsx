import { Maximize2 } from "lucide-react";

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/shared/components/ui/carousel";
import type { CatalogImage } from "@/shared/lib/shopify/catalog-mapper";
import { cn } from "@/shared/lib/utils";
import { ProductDetailGalleryImage } from "./product-detail-gallery-image";

function GallerySlide({ image, index, onOpen, title }: {
  image: CatalogImage;
  index: number;
  onOpen: () => void;
  title: string;
}) {
  return (
    <CarouselItem className="relative aspect-square w-full">
      <button type="button" aria-label={`Enlarge ${title} image ${index + 1}`} onClick={onOpen} className="group relative size-full cursor-zoom-in rounded-sm bg-warm p-8 transition-colors duration-300 md:p-12">
        <ProductDetailGalleryImage image={image} alt={`Main view of ${title}`} priority={index === 0} sizes="(max-width: 1023px) 100vw, 546px" />
        <span className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/80 text-black opacity-0 shadow-sm backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
          <Maximize2 className="size-4" aria-hidden="true" />
        </span>
      </button>
    </CarouselItem>
  );
}

function GalleryThumbnail({ active, image, index, onSelect, title }: {
  active: boolean;
  image: CatalogImage;
  index: number;
  onSelect: (index: number) => void;
  title: string;
}) {
  return (
    <button type="button" aria-label={`View ${title} image ${index + 1}`} aria-pressed={active} onClick={() => onSelect(index)} className={cn(
      "group relative size-25 cursor-pointer overflow-hidden rounded-sm border bg-warm p-2 transition-all duration-300",
      active ? "scale-[1.02] border-black" : "border-transparent hover:border-black/40",
    )}>
      <ProductDetailGalleryImage image={image} alt={`${title} detail view ${index + 1}`} sizes="100px" className="transition-transform duration-300 group-hover:scale-105" />
    </button>
  );
}

export function ProductDetailGalleryCarousel({ activeIndex, bestSeller, images, onOpen, onSelect, setApi, title }: {
  activeIndex: number;
  bestSeller: boolean;
  images: CatalogImage[];
  onOpen: () => void;
  onSelect: (index: number) => void;
  setApi: (api: CarouselApi) => void;
  title: string;
}) {
  return (
    <>
      <Carousel setApi={setApi} className="relative w-full">
        {bestSeller ? <span className="absolute left-4 top-4 z-10 rounded-sm bg-navy-dark px-4 py-2 font-sans text-xs font-medium text-white shadow-sm">Best Seller</span> : null}
        <CarouselContent>{images.map((image, index) => <GallerySlide key={image.url} image={image} index={index} onOpen={onOpen} title={title} />)}</CarouselContent>
      </Carousel>
      <div className="mt-4 flex flex-row gap-4">
        {images.map((image, index) => <GalleryThumbnail key={image.url} active={activeIndex === index} image={image} index={index} onSelect={onSelect} title={title} />)}
      </div>
    </>
  );
}

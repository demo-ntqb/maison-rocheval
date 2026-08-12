import { Picture } from "@/shared/components/ui/picture";

export interface ProductDetailImageGalleryProps {
  images: string[];
  title: string;
  bestSeller?: boolean;
}

export function ProductDetailImageGallery({
  images,
  title,
  bestSeller = false,
}: ProductDetailImageGalleryProps) {
  const mainImage = images[0] || "/images/about-product/species-kaluga-hybrid";

  return (
    <div className="flex w-full flex-col">
      {/* Main Image Container */}
      <div className="relative aspect-square w-full rounded-sm bg-warm p-8 md:p-12">
        {bestSeller && (
          <span className="absolute left-4 top-4 z-10 rounded-sm bg-navy-dark px-4 py-2 font-sans text-xs font-medium text-white shadow-sm">
            Best Seller
          </span>
        )}
        <Picture
          basePath={mainImage}
          fallbackExtension="png"
          alt={`Main view of ${title}`}
          priority
          width={600}
          height={600}
          sizes="(max-width: 1023px) 100vw, 546px"
          pictureClassName="block size-full"
          className="size-full object-contain"
        />
      </div>

      {/* Thumbnails Row */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {images.map((imagePath, index) => (
          <div
            key={imagePath + index}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-sm border border-line bg-canvas p-2 transition-colors hover:border-black"
          >
            <Picture
              basePath={imagePath}
              fallbackExtension="png"
              alt={`${title} detail view ${index + 1}`}
              width={200}
              height={200}
              sizes="100px"
              pictureClassName="block size-full"
              className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

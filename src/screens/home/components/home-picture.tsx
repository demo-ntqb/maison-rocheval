import type { ComponentPropsWithoutRef } from "react";

import { buildPictureSources } from "@/shared/lib/image";

interface HomePictureProps
  extends Omit<ComponentPropsWithoutRef<"img">, "height" | "loading" | "src" | "width"> {
  basePath: string;
  fallbackExtension: "jpg" | "jpeg" | "png";
  height: number;
  pictureClassName?: string;
  picturePlumbId?: string;
  priority?: boolean;
  width: number;
}

export function HomePicture({
  alt,
  basePath,
  fallbackExtension,
  height,
  pictureClassName,
  picturePlumbId,
  priority = false,
  sizes,
  width,
  ...imageProps
}: HomePictureProps) {
  const sources = buildPictureSources(basePath, fallbackExtension);

  return (
    <picture className={pictureClassName} data-plumb-id={picturePlumbId}>
      <source srcSet={sources.avif} type="image/avif" />
      <source srcSet={sources.webp} type="image/webp" />
      <img
        src={sources.fallback}
        alt={alt}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        width={width}
        height={height}
        sizes={sizes}
        {...imageProps}
      />
    </picture>
  );
}

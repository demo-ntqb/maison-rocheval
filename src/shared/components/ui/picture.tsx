import type { ComponentPropsWithoutRef } from "react";

import { buildPictureSources } from "@/shared/lib/image";

interface PictureProps
  extends Omit<ComponentPropsWithoutRef<"img">, "height" | "loading" | "src" | "width"> {
  basePath: string;
  fallbackExtension: "jpg" | "jpeg" | "png";
  height: number;
  pictureClassName?: string;
  priority?: boolean;
  responsiveWidths?: number[];
  width: number;
}

export function Picture({
  alt,
  basePath,
  fallbackExtension,
  height,
  pictureClassName,
  priority = false,
  responsiveWidths,
  sizes,
  width,
  ...imageProps
}: PictureProps) {
  const sources = buildPictureSources(basePath, fallbackExtension);
  const buildSrcSet = (extension: string, fallbackPath: string) => {
    if (!responsiveWidths?.length) {
      return fallbackPath;
    }

    return [
      ...responsiveWidths.map((responsiveWidth) => `${basePath}-${responsiveWidth}.${extension} ${responsiveWidth}w`),
      `${fallbackPath} ${width}w`,
    ].join(", ");
  };

  return (
    <picture className={pictureClassName}>
      <source srcSet={buildSrcSet("avif", sources.avif)} type="image/avif" />
      <source srcSet={buildSrcSet("webp", sources.webp)} type="image/webp" />
      <img
        src={sources.fallback}
        srcSet={responsiveWidths?.length ? buildSrcSet(fallbackExtension, sources.fallback) : undefined}
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

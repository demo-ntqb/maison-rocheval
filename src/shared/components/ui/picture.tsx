import type { ComponentPropsWithoutRef } from "react";

import { buildPictureSources } from "@/shared/lib/image";

/**
 * A breakpoint-gated image swap (not just a resolution swap) — e.g. a
 * completely different crop or photo on desktop vs. mobile. Rendered as
 * `<source media>` entries ahead of the base `basePath` sources, so the
 * base acts as the fallback for whichever media query doesn't match.
 */
interface ArtDirectedSource {
  basePath: string;
  fallbackExtension?: "jpg" | "jpeg" | "png";
  media: string;
}

interface PictureProps
  extends Omit<ComponentPropsWithoutRef<"img">, "height" | "loading" | "src" | "width"> {
  artDirected?: ArtDirectedSource[];
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
  artDirected,
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
  const buildSrcSet = (sourceBasePath: string, extension: string, fallbackPath: string) => {
    if (!responsiveWidths?.length) {
      return fallbackPath;
    }

    return [
      ...responsiveWidths.map((responsiveWidth) => `${sourceBasePath}-${responsiveWidth}.${extension} ${responsiveWidth}w`),
      `${fallbackPath} ${width}w`,
    ].join(", ");
  };

  return (
    <picture className={pictureClassName}>
      {artDirected?.flatMap(({ basePath: artBasePath, fallbackExtension: artExtension = fallbackExtension, media }) => {
        const artSources = buildPictureSources(artBasePath, artExtension);

        return [
          <source key={`${artBasePath}-avif`} media={media} srcSet={buildSrcSet(artBasePath, "avif", artSources.avif)} type="image/avif" />,
          <source key={`${artBasePath}-webp`} media={media} srcSet={buildSrcSet(artBasePath, "webp", artSources.webp)} type="image/webp" />,
        ];
      })}
      <source srcSet={buildSrcSet(basePath, "avif", sources.avif)} type="image/avif" />
      <source srcSet={buildSrcSet(basePath, "webp", sources.webp)} type="image/webp" />
      <img
        src={sources.fallback}
        srcSet={responsiveWidths?.length ? buildSrcSet(basePath, fallbackExtension, sources.fallback) : undefined}
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

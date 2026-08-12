export interface PictureSources {
  avif: string;
  webp: string;
  fallback: string;
}

export function buildPictureSources(
  path: string,
  fallbackExtension: "jpg" | "jpeg" | "png",
): PictureSources {
  const basePath = path.replace(/\.(?:avif|jpe?g|png|webp)$/iu, "");
  const normalizedFallback = fallbackExtension.toLowerCase();

  return {
    avif: `${basePath}.avif`,
    webp: `${basePath}.webp`,
    fallback: `${basePath}.${normalizedFallback}`,
  };
}

export function ProductDetailPackagingThumbnail({ id }: { id: string }) {
  const knownId = id === "premium" || id === "luxury" ? id : "standard";
  return (
    <picture className="block size-full">
      <source srcSet={`/images/product-detail/packaging-${knownId}.avif`} type="image/avif" />
      <source srcSet={`/images/product-detail/packaging-${knownId}.webp`} type="image/webp" />
      <img
        src={`/images/product-detail/packaging-${knownId}.png`}
        alt=""
        aria-hidden="true"
        width={54}
        height={54}
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
    </picture>
  );
}
